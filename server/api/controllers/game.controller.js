const fs = require("fs");
const axios = require("axios");
const {stringsSimilarityPercentage} = require("./../../utils");
const path = require("path");
const {PS2Repositories} = require("../../resources/games");
const HTMLParser = require("node-html-parser");
const {decimalTo32octetsBinary, binaryToDecimal} = require("../../utils");

const gamesDirectory = `${appRoot}/public/games`;
const alphabetArray = ["0-9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

const authenticate = async () => {
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`)
        .then(response => response.data);
    return response["access_token"];
}

const _igdbRequest = async (type, body, igdbToken) => {
    igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
    return await axios({
            url: `https://api.igdb.com/v4/${type}`,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': `Bearer ${igdbToken}`,
            },
            data: body
        }).then(response => {
            return response.data;
    });
}

const parseImageSize = url => url.replace(new RegExp(/(cover_small|screenshot_med|cover_big|logo_med|screenshot_big|screenshot_huge|thumb|micro|720p)/), "1080p");

const _getNewGameList = async (igdbToken) => {
    try {
        const gameListPath = `${gamesDirectory}/game_list.json`;
        const games = (!fs.existsSync(gameListPath)) ? await _refreshNewGameList(igdbToken) : JSON.parse(fs.readFileSync(gameListPath, "utf-8"));
        return {
            type: "success",
            value: games
        };
    } catch (e) {
        console.log(e);
        return {
            type: "error",
            value: e
        }
    }
}

const _createGameDetails = (filePath, details) => {
    try{
        fs.mkdirSync(path.parse(filePath).dir, { recursive: true });
        const writer = fs.createWriteStream(filePath, {flags: 'w'});
        writer.write(JSON.stringify(details));
        return true;
    }catch(e){
        console.log(e);
        return false;
    }
}

const _parseCompaniesLogo = companies => {
    for(let object of companies){
        if("company" in object && "logo" in object.company && "url" in object.company.logo)
            object.company.logo.url = object.company.logo.url.replace("t_thumb","t_logo_med").replace(".jpg",".png");
    }
    return companies
}

const _findTag = async (id, typeId, igdbToken) => {
    const types = ["themes","genres","keywords",null,"player_perspectives"]
    if(typeId !== 3){
        try {
            const data = await _igdbRequest(types[typeId], `fields name; where id = (${id});`, igdbToken);
            return data.map(e => {return { ...e, "type": types[typeId]}});
        } catch (e) {
            return [];
        }
    }
    return [];
}

const parseGameDetailsTag = async (tags, igdbToken) => {
    const result = [];
    for (let i of tags.slice(0, process.env.MAX_TAGS_NUMBER)) {
        const binary = decimalTo32octetsBinary(i);
        const tagsDetails = await _findTag(binaryToDecimal(binary.slice(4, 32).join("")), binaryToDecimal(binary.slice(0, 4).join("")), igdbToken);
        result.push(...tagsDetails);
    }
    return result;
}

const correctNameDefault = (search) => {
    const numberRegex = new RegExp(/[0-9]*?(\.)[0.9]*?/);
    return search.replace(numberRegex,",");
}

const _searchGameDetails = async (search, igdbToken) => {
    search = correctNameDefault(search);
    const searchArray = search.split(/ |-/).map((e,i) => search.split(/ |-/).slice(0,search.split(/ |-/).length - i).join(" "));
    let rawGames = [];
    for(const search of searchArray){
        const result = await axios.get(`https://www.igdb.com/advanced_search?d=1&f[type]=games&q=${search}&s=score&f[platforms.id_in]=8`,{
            headers:{
                "x-requested-with": "XMLHttpRequest"
            }
        }).then(response => (response.data ?? []));
        rawGames.push(...[...result].filter(e => !rawGames.includes(e.name)).map(e => e.name));
    }
    rawGames = [...rawGames].map(game => {
        return {
            "name":game,
            "similarity": stringsSimilarityPercentage(game, search)
        }
    });
    const maxSimilarity = (rawGames.reduce((a,b) => Math.max(a,b.similarity), 0));
    const threshold = (maxSimilarity > 0.5) ? ((maxSimilarity > 0.75) ? ((maxSimilarity === 1) ?  0 : 0.1 ) : 0.2) : 0.5;
    const searches = keepBestMatches(rawGames, threshold);
    if(rawGames.length > 0){
        try{
            const results = [];
            for(let searchName of searches.map(e => e.name)){
                let data = await _igdbRequest("games", `fields alternative_names, category, total_rating, rating, tags, involved_companies.company.name, involved_companies.company.logo.url, name, cover.url, screenshots.url, summary, videos.video_id; where platforms = (8) & name ~ *"${searchName}"*;`, igdbToken)
                if([...data].length === 0){
                    data = await _igdbRequest("games", `fields alternative_names, category, total_rating, rating, tags, involved_companies.company.name, involved_companies.company.logo.url, name, cover.url, screenshots.url, summary, videos.video_id; where name ~ *"${searchName}"*;`, igdbToken)
                }

                for(const e of [...data]){
                    if(!results.includes(e.name)){
                        if ("alternative_names" in e && e["alternative_names"].length > 0) {
                            const regex = new RegExp(/\(.*?\)/);
                            let names = await _igdbRequest("alternative_names", `fields name; where id = (${e["alternative_names"].join(",")});`);
                            names = names.map(e => e.name.replace(regex, "").trim());
                            e["similarity"] = [e.name, ...names].reduce((a,b) => Math.max(stringsSimilarityPercentage(b, search), a), 0);
                        }
                        else{
                            e["similarity"] = stringsSimilarityPercentage(e.name, search);
                        }
                        results.push({
                            ...e,
                            "cover": {"url": e?.cover?.url?.replace("t_thumb", "t_cover_big")},
                            "screenshots": e?.screenshots?.map(s => {
                                return {...s, "url": s.url.replace("t_thumb", "t_original")}
                            })
                        })
                    }
                }
            }
            return results;
        }catch(e){
            console.log(e);
            return [];
        }
    }
    else{
        return [];
    }
}

const keepBestMatch = (matches) => {
    return matches.reduce((bestMatch, element) => (element.similarity > bestMatch.similarity) ? element : bestMatch, matches[0]);
}

const keepBestMatches = (matches, threshold = 0.1) => {
    if(matches.length > 0){
        const bestSimilarity = matches.reduce((bestMatch, element) => (element.similarity > bestMatch.similarity) ? element : bestMatch, matches[0]).similarity;
        return matches.filter(e => e.similarity >= bestSimilarity - threshold);
    }
    return [];
}

const _refreshNewGameList = async () => {
    let games = [];
    for (let repository of PS2Repositories) {
        const url = repository.link;
        let page;
        try {
            page = await axios.get(url).then(response => response.data);
        } catch (e) {
            console.log(e);
            continue;
        }
        page = HTMLParser.parse(page.toString(), {blockTextElements: {pre: true}}).getElementsByTagName("html")[0].getElementsByTagName("body")[0].getElementById("wrap").getElementById("maincontent").querySelectorAll(".container")[0].querySelectorAll(".download-directory-listing")[0].querySelectorAll("pre")[0];
        page = HTMLParser.parse(page.firstChild.rawText).querySelectorAll("table")[0].querySelectorAll("tr");
        for (let i of page) {
            let row = i.querySelectorAll("td");
            for (let y of row) {
                const link = y.querySelectorAll("a")[0];
                if (link && link.getAttribute("href").includes(".zip")) {
                    games.push({
                        rawName: link.rawText,
                        name: parseName(link.rawText),
                        directory: parseDirectory(link.rawText),
                        url: `${url}/${link.getAttribute("href")}`
                    });
                }
            }
        }
    }

    const writer = fs.createWriteStream(`${gamesDirectory}/game_list.json`, {flags: 'w'});
    games = filterGames(games);
    writer.write(JSON.stringify(games));
    return games;
}

const parseDirectory = (name) => {
    const regex = /(\(.*?\)|(.zip))/gm;
    const regex1 = /[^a-zA-Z0-9 :]/g;
    const regex2 = /(\s+)/gm;
    return name.replace(regex, "").replace(regex1, "_").trim().replace(regex2, "-");
}

const parseName = (name) => {
    const regex = /(\(.*?\)|(.zip))/gm;
    const regex2 = / - /gm;
    name = name.replace(regex, "").replace(regex2, "-");
    return name.trim();
}

const filterGames = (games) => {
    return games.reduce((list, game) => {
        const index = list.findIndex(i => i.name === game.name);
        (index === -1) ? list.push({name: game.name,directory: game.directory, games: [{"rawName":game.rawName, "url":game.url}]}) : list[index].games.push({"rawName":game.rawName, "url":game.url});
        return list;
    }, []);
}

const findDirectoryByLetter = (gameDirectory) => {
    const digit = new RegExp(/[0-9]/);
    const firstLetter = gameDirectory[0];
    if(digit.test(firstLetter)){
        return `${gamesDirectory}/0-9/${gameDirectory}`;
    }
    return `${gamesDirectory}/${firstLetter}/${gameDirectory}`;
}

const createAlphabetDirectory = () => {
    for(let i of alphabetArray){
        const directory = `${gamesDirectory}/${i}`;
        if(!fs.existsSync(directory)){
            fs.mkdirSync(directory);
        }
    }
}

const findGamePath = directory => {
    try{
        return fs.readdirSync(directory).filter(e => e.includes("iso") || e.includes("bin")).map(e => `${directory}/${e}`);
    }catch(e){
        console.log(e);
        return null;
    }
}

module.exports = (app, igdbToken, downloads) => {
    const module = {};
    module.downloadsToResume = async (req,res) => {
        try{
            const result = [];
            igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
            let games = await _getNewGameList(igdbToken);
            for(const game of games.value){
                const gameDirectory = findDirectoryByLetter(game.directory).replaceAll(new RegExp(/\\/g), "/");
                const informationFilePath = `${gameDirectory}/${process.env.INFORMATIONS_FILENAME}`;
                if( !(gameDirectory in downloads) && fs.existsSync(informationFilePath)){
                    const information = JSON.parse(fs.readFileSync(informationFilePath, "utf-8"));
                    const details = JSON.parse(fs.readFileSync(`${findDirectoryByLetter(game.directory)}/details.json`, "utf-8"));
                    const downloadedSize = information["chunks"].map((chunk,i) => fs.statSync(`${gameDirectory}/game${i + 1}.zip`)?.size).reduce((a, b) => a + b, 0);
                    if("state" in information && information.state === "downloading"){
                        result.push({
                            ...game,
                            "percentage": (downloadedSize / information.total * 100).toFixed(0),
                            "name": details.name,
                            "picture": details.cover ?? null,
                            "games": game.games.filter(e => e.url === information.url)
                        });
                    }
                }
            }
            res.send({
                type:"success",
                value: result
            });
        }
        catch(e){
            console.log(e)
            res.send({
                type:"error",
                value:[]
            })
        }
    }
    module.searchGameByName = async (req, res) => {
        const { search } = req.body;
        igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
        let result = await _getNewGameList(igdbToken);
        if("type" in result && result.type === "success"){
            result.value = result.value.filter(game =>
                game.name.split(/ |-/).findIndex(partialName => stringsSimilarityPercentage(search.toLowerCase(), partialName.toLowerCase()) > 0.8) !== -1
                ||
                game.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        res.send(result);
    }
    module.generateAllDetails = async (req, res) => {
        igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
        createAlphabetDirectory();
        const result = await _getNewGameList(igdbToken);
        let i = 0;
        let error = [];
        for(const search of result.value){
            let game = {};
            const detailPath = `${findDirectoryByLetter(search.directory)}/details.json`;
            try{
                if(fs.existsSync(detailPath)){
                    i++;
                    console.log(`${i}/${result.value.length}`);
                    continue;
                }
                const response = await _searchGameDetails(search.name ,igdbToken);
                if(response.length > 0){
                    game = keepBestMatch(response);
                    if("involved_companies" in game){
                        game["involved_companies"] = _parseCompaniesLogo(game["involved_companies"]);
                    }
                    _createGameDetails(detailPath,game);
                }
                else{
                    igdbToken = await authenticate(igdbToken);
                    const response = await _searchGameDetails(search.name ,igdbToken);
                    if(response.length > 0){
                        game = keepBestMatch(response);
                        if("involved_companies" in game){
                            game["involved_companies"] = _parseCompaniesLogo(game["involved_companies"]);
                        }
                        _createGameDetails(detailPath,game);
                    }
                    else{
                        error.push(search.name);
                    }
                }
            }catch(e){
                error.push(search.name);
            }
            i++;
            console.log(`${i}/${result.value.length}`);
        }
        res.send(error);
    }
    module.refreshNewGameList = async (req,res) => {
        try{
            igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
            const games = await _refreshNewGameList(igdbToken);
            res.send({
                type:"success",
                value: games
            })
        }catch(e){
            console.log(e);
            res.send({
                type:"error",
                value:e
            })
        }
    }

    module.getNewGameList = async (req,res) => {
        igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
        const result = await _getNewGameList(igdbToken);
        res.send(result);
    }

    module.searchGameDetails = async (req, res) => {
        const {search, directoryName} = req.body;

        let game = {};
        const basePath = findDirectoryByLetter(directoryName);
        const detailPath = `${basePath}/details.json`;
        const informationFilePath = `${basePath}/${process.env.INFORMATIONS_FILENAME}`;
        if(fs.existsSync(detailPath)){
            try{
                const details = fs.readFileSync(detailPath, "utf-8");
                game = {
                    ...JSON.parse(details),
                    "state": null
                };
                if("tags" in game && typeof game.tags[0] !== 'object'){
                    game.tags = await parseGameDetailsTag(game.tags, igdbToken);
                    if("involved_companies" in game){
                        game["involved_companies"] = _parseCompaniesLogo(game["involved_companies"]);
                    }
                    _createGameDetails(detailPath,game);
                }
                if(fs.existsSync(informationFilePath)){
                    const temp = JSON.parse(fs.readFileSync(informationFilePath, "utf-8"));
                    game.state = temp.state;
                }
            }catch(e){
                console.log(e);
            }
        }
        else{
            igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
            const response = await _searchGameDetails(search ,igdbToken);
            if(response.length > 0){
                game = keepBestMatch(response);
                if("tags" in game){
                    game.tags = await parseGameDetailsTag(game.tags, igdbToken);
                }
                if("involved_companies" in game){
                    game["involved_companies"] = _parseCompaniesLogo(game["involved_companies"]);
                }
                _createGameDetails(detailPath,game);
            }
            else{
                res.send({
                    type:"error",
                    value: "Aucun jeu trouvé"
                });
                return;
            }
        }

        res.send({
            type: "success",
            value: game
        });
    }

    module.getGames = async (req, res) => {
        let games = [];
        let files;
        const allDirectories = alphabetArray.map(letter => `${gamesDirectory}/${letter}`);
        if (fs.existsSync(gamesDirectory)) {
            try {
                files = allDirectories.reduce((a,directory) => {
                    a.push(...fs.readdirSync(directory).map(e => `${directory}/${e}`));
                    return a;
                },[]);
                files.forEach(folder => {
                    if(fs.existsSync(`${folder}/${process.env.INFORMATIONS_FILENAME}`)){
                        let informations = JSON.parse(fs.readFileSync(`${folder}/${process.env.INFORMATIONS_FILENAME}`,"utf-8"));
                        if ("state" in informations && informations.state === "downloaded") {
                            const gamePath = findGamePath(folder);
                            if(gamePath !== null){
                                let details = JSON.parse(fs.readFileSync(`${folder}/details.json`,"utf-8"));
                                games.push({
                                    ...details,
                                    "path": gamePath
                                });
                            }
                        }
                    }
                });
                res.send({
                    type:"success",
                    value:games
                })
            } catch (e) {
                res.send({
                    type:"error",
                    value:"Error trying to read the emulator directory"
                });
            }
        } else {
            res.send({
                type:"error",
                value:"Error reading the emulator directory"
            });
        }
    }

    module.getGenres = async (req,res) => {
        let result;
        const genresPath = `${gamesDirectory}/genres.json`;
        if(fs.existsSync(genresPath)){
            result = JSON.parse(fs.readFileSync(genresPath, "utf-8"));
            res.send({
                type: "success",
                value: result
            })
        }
        else{
            try {
                result = await _igdbRequest("genres",`fields name; sort id asc; limit 500;`, igdbToken);
                const writer = fs.createWriteStream(genresPath, {flags: 'w'});
                writer.write(JSON.stringify(result));
                res.send({
                    type: "success",
                    value: result
                });
            } catch (e) {
                console.log(e);
                res.send({
                    type: "error",
                    value: e
                });
            }
        }

    }

    module.searchByGenre = async (req,res) => {
        const { genres } = req.body;
        const igdbGames = [];
        let tempGames = [];
        igdbToken = (!igdbToken) ? await authenticate(igdbToken) : igdbToken;
        while( igdbGames.length === 0 || tempGames.length !== 0){
            try{
                tempGames = await _igdbRequest("games",`fields name; where platforms = (8) & genres = (${genres.join(",")}); limit 50; offset ${igdbGames.length};`, igdbToken);
                tempGames = tempGames.map(e => {
                    return {
                        ...e,
                        "cover": {"url": e?.cover?.url?.replace("t_thumb", "t_cover_big")},
                        "screenshots": e?.screenshots?.map(s => {
                            return {...s, "url": s.url.replace("t_thumb", "t_original")}
                        })
                    }
                });
            }catch(e){
                console.log(e);
                tempGames = [];
            }
            igdbGames.push(...tempGames);
        }
        const newGameList = await _getNewGameList(igdbToken);
        if(newGameList.type === "error"){
            res.send(newGameList);
            return;
        }
        const result = [];
        for(let i of igdbGames){
            let correspondingGameFromNewGameList = null;
            for(let y of newGameList.value){
                const similarity = stringsSimilarityPercentage(i.name, y.name);
                if(correspondingGameFromNewGameList === null || similarity >= correspondingGameFromNewGameList.similarity){
                    correspondingGameFromNewGameList = {game: y, similarity: similarity}
                    if(similarity === 1){
                        break;
                    }
                }
            }
            if(correspondingGameFromNewGameList.similarity > process.env.MATCH_PERCENTAGE_THREESOLD){
                result.push(correspondingGameFromNewGameList.game)
            }
        }
        res.send({
            type: "success",
            value: result
        });
    }

    return module;
}
