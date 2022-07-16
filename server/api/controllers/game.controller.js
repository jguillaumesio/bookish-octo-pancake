const fs = require("fs");
const axios = require("axios");
const {filterByArray, stringsSimilarityPercentage} = require("./../../utils");
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

const _igdbRequest = async (type, body, token) => {
    token = (!token) ? await authenticate(token) : token;
    return await axios({
            url: `https://api.igdb.com/v4/${type}`,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': `Bearer ${token}`,
            },
            data: body
        }).then(response => {
            return response.data;
    });
}

const _getNewGameList = async (token) => {
    try {
        const gameListPath = `${gamesDirectory}/game_list.json`;
        const games = (!fs.existsSync(gameListPath)) ? await _refreshNewGameList(token) : JSON.parse(fs.readFileSync(gameListPath, "utf-8"));
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

const _findTag = async (id, typeId, token) => {
    const types = ["themes","genres","keywords",null,"player_perspectives"]
    if(typeId !== 3){
        try {
            const data = await _igdbRequest(types[typeId], `fields name; where id = (${id});`, token);
            return data.map(e => {return { ...e, "type": types[typeId]}});
        } catch (e) {
            return [];
        }
    }
    return [];
}

const parseGameDetailsTag = async (tags, token) => {
    const result = [];
    for (let i of tags.slice(0, process.env.MAX_TAGS_NUMBER)) {
        const binary = decimalTo32octetsBinary(i);
        const tagsDetails = await _findTag(binaryToDecimal(binary.slice(4, 32).join("")), binaryToDecimal(binary.slice(0, 4).join("")), token);
        result.push(...tagsDetails);
    }
    return result;
}

const correctNameDefault = (search) => {
    const numberRegex = new RegExp(/[0-9]*?(\.)[0.9]*?/);
    return search.replace(numberRegex,",");
}

const _searchGameDetails = async (search, token) => {
    search = correctNameDefault(search);
    const searchArray = search.split(/ |-/).map((e,i) => search.split(/ |-/).slice(0,search.split(/ |-/).length - i).join(" "));
    let rawGames = [];
    for(const search of searchArray){
        const result = await axios.get(`https://www.igdb.com/search_autocomplete_all?q=${search}`,{
            headers:{
                "x-requested-with": "XMLHttpRequest"
            }
        }).then(response => (response.data["game_suggest"] ?? []));
        rawGames.push(...[...result].filter(e => !rawGames.includes(e.name)).map(e => e.name));
    }
    rawGames = [...rawGames].filter(rawGame => filterByArray(rawGame, search)).map(game => {
        return {
            "name":game,
            "similarity": stringsSimilarityPercentage(game, search)
        }
    });
    const searches = keepBestMatches(rawGames);
    if(rawGames.length > 0){
        try{
            const results = [];
            for(let searchName of searches.map(e => e.name)){
                let data = await _igdbRequest("games", `fields category, total_rating, rating, tags, involved_companies.company.name, involved_companies.company.logo.url, name, cover.url, screenshots.url, summary, videos.video_id; where platforms = (8) & name ~ *"${searchName}"*;`, token)
                if([...data].length === 0){
                    data = await _igdbRequest("games", `fields category, total_rating, rating, tags, involved_companies.company.name, involved_companies.company.logo.url, name, cover.url, screenshots.url, summary, videos.video_id; where name ~ *"${searchName}"*;`, token)
                }
                results.push(...[...data].map(e => {
                    return {
                        ...e,
                        "cover": {"url": e?.cover?.url?.replace("t_thumb", "t_cover_big")},
                        "screenshots": e?.screenshots?.map(s => {
                            return {...s, "url": s.url.replace("t_thumb", "t_original")}
                        }),
                        "similarity": stringsSimilarityPercentage(e.name, search)
                    }
                }).filter(e => !results.includes(e)))
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

const keepBestMatches = (matches, threesold = 0.1) => {
    const bestSimilarity = matches.reduce((bestMatch, element) => (element.similarity > bestMatch.similarity) ? element : bestMatch, matches[0]).similarity;
    return matches.filter(e => e.similarity >= bestSimilarity - threesold);
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

module.exports = (app, token) => {
    const module = {};
    module.searchGameByName = async (req, res) => {
        const { search } = req.body;
        token = (!token) ? await authenticate(token) : token;
        let result = await _getNewGameList(token);
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
        token = (!token) ? await authenticate(token) : token;
        createAlphabetDirectory();
        const result = await _getNewGameList(token);
        let i = 0;
        let error = [];
        for(const search of result.value){
            let game = {};
            const detailPath = `${findDirectoryByLetter(search.games[0].directory)}/details.json`;
            try{
                const response = await _searchGameDetails(search.name ,token);
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
            }catch(e){
                error.push(search.name);
            }
            i++;
        }
        res.send(error);
    }

    module.refreshNewGameList = async (req,res) => {
        try{
            token = (!token) ? await authenticate(token) : token;
            const games = await _refreshNewGameList(token);
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
        token = (!token) ? await authenticate(token) : token;
        const result = await _getNewGameList(token);
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
                    game.tags = await parseGameDetailsTag(game.tags,token);
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
            token = (!token) ? await authenticate(token) : token;
            const response = await _searchGameDetails(search ,token);
            game = keepBestMatch(response);
            if("tags" in game){
                game.tags = await parseGameDetailsTag(game.tags,token);
            }
            if("involved_companies" in game){
                game["involved_companies"] = _parseCompaniesLogo(game["involved_companies"]);
            }
            _createGameDetails(detailPath,game);
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
                            let details = JSON.parse(fs.readFileSync(`${folder}/details.json`,"utf-8"));
                            games.push(details);
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
                result = await _igdbRequest("genres",`fields name; sort id asc; limit 500;`, token);
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
        token = (!token) ? await authenticate(token) : token;
        while( igdbGames.length === 0 || tempGames.length !== 0){
            try{
                tempGames = await _igdbRequest("games",`fields name; where platforms = (8) & genres = (${genres.join(",")}); limit 50; offset ${igdbGames.length};`, token);
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
        const newGameList = await _getNewGameList(token);
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
