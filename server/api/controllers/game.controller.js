const fs = require("fs");
const axios = require("axios");
const {stringsSimilarityPercentage} = require("./../../utils");
const path = require("path");
const {PS2Repositories} = require("../../resources/games");
const HTMLParser = require("node-html-parser");
const {decimalTo32octetsBinary, binaryToDecimal} = require("../../utils");

const gamesDirectory = `${appRoot}/public/games`;

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
    for (let i of tags) {
        const binary = decimalTo32octetsBinary(i);
        const tagsDetails = await _findTag(binaryToDecimal(binary.slice(4, 32).join("")), binaryToDecimal(binary.slice(0, 4).join("")), token);
        result.push(...tagsDetails);
    }
    return result;
}

const _searchGameDetails = async (search, token) => {
    try{
        const data = await _igdbRequest("games", `fields category, total_rating, rating, tags, involved_companies.company.name, involved_companies.company.logo.url, name, cover.url, screenshots.url, summary, videos.video_id; where platforms = (8) & name ~ *"${search}"*;`, token)
        return data.map(e => {
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
        return [];
    }
}

const keepBestMatch = (matches) => {
    return matches.reduce((bestMatch, element) => (element.matchPercentage > bestMatch.matchPercentage) ? element : bestMatch, matches[0]);
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
        page = HTMLParser.parse(page.toString(), {blockTextElements: {pre: true}})
            .getElementsByTagName("html")[0]
            .getElementsByTagName("body")[0]
            .getElementById("wrap")
            .getElementById("maincontent")
            .querySelectorAll(".container")[0]
            .querySelectorAll(".download-directory-listing")[0]
            .querySelectorAll("pre")[0];
        page = HTMLParser.parse(page.firstChild.rawText)
            .querySelectorAll("table")[0]
            .querySelectorAll("tr");
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
        (index === -1) ? list.push({name: game.name, games: [game]}) : list[index].games.push(game);
        return list;
    }, []);
}

module.exports = (app, token) => {
    const module = {};
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
        const detailPath = `${gamesDirectory}/${directoryName}/details.json`;
        const informationFilePath = `${gamesDirectory}/${directoryName}/${process.env.INFORMATIONS_FILENAME}`;
        if(fs.existsSync(detailPath)){
            try{
                const details = fs.readFileSync(detailPath, "utf-8");
                game = {
                    ...JSON.parse(details),
                    "state": null
                };
                if(fs.existsSync(informationFilePath)){
                    const temp = JSON.parse(fs.readFileSync(informationFilePath, "utf-8"));
                    game.state = temp.state;
                }
            }catch(e){
                console.log(e);
            }
        }
        else{
            const regexDigitsOnly = /^\d+$/gm;
            const searchArray = search.split(/-| |:/).map(e => e.trim()).filter(e => e.length >= 2 && !e.match(regexDigitsOnly))

            token = (!token) ? await authenticate(token) : token;

            let response = await _searchGameDetails(search, token);
            response = response.map(game => { return{
                ...game,
                matchPercentage: stringsSimilarityPercentage(game.name, search)
            }});
            if(new RegExp(/[0-9]/g).test(search)){
                let result = await _searchGameDetails(search.replace(/[0-9]/g, ""), token);
                response.push(...result.map(game => { return{
                    ...game,
                    matchPercentage: stringsSimilarityPercentage(game.name, search)
                }}));
            }
            if (search.includes("-")){
                const searchArrayByTiret = search.split("-")
                for (let i of searchArrayByTiret) {
                    let result = await _searchGameDetails(i, token);
                    result = result.map(game => { return{
                        ...game,
                        matchPercentage: stringsSimilarityPercentage(game.name, search)
                    }});
                    response.push(...result);
                    if(result.findIndex(game => game.matchPercentage === 1) !== -1){
                        break;
                    }
                    i++;
                }
            }
            if (search.includes("-")){
                let result = await _searchGameDetails(search.replace(/-/,": "), token);
                response.push(...result.map(game => { return{
                    ...game,
                    matchPercentage: stringsSimilarityPercentage(game.name, search)
                }}));
            }
            if (searchArray !== 0) {
                for (let i of searchArray) {
                    let result = await _searchGameDetails(i, token);
                    result = result.map(game => { return{
                        ...game,
                        matchPercentage: stringsSimilarityPercentage(game.name, search)
                    }});
                    response.push(...result);
                    if(result.findIndex(game => game.matchPercentage === 1) !== -1){
                        break;
                    }
                    i++;
                }
            }

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
        if (fs.existsSync(gamesDirectory)) {
            try {
                files = fs.readdirSync(gamesDirectory);
                files.forEach(folder => {
                    if (fs.lstatSync(`${gamesDirectory}/${folder}`).isDirectory()) {
                        if(fs.existsSync(`${gamesDirectory}/${folder}/${process.env.INFORMATIONS_FILENAME}`)){
                            let informations = JSON.parse(fs.readFileSync(`${gamesDirectory}/${folder}/${process.env.INFORMATIONS_FILENAME}`,"utf-8"));
                            if ("state" in informations && informations.state === "downloaded") {
                                let details = JSON.parse(fs.readFileSync(`${gamesDirectory}/${folder}/details.json`,"utf-8"));
                                games.push(details);
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
