const fs = require("fs");
const axios = require("axios");
const {stringsSimilarityPercentage} = require("./../../utils");
const path = require("path");
const {PS2Repositories} = require("../../resources/games");
const HTMLParser = require("node-html-parser");
const {decimalTo32octetsBinary, binaryToDecimal} = require("../../utils");

const gamesDirectory = `${appRoot}/public/games`;

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

const authenticate = async () => {
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`)
        .then(response => response.data);
    return response["access_token"];
}

const _createGameDetails = (path, details) => {
    try{
        const writer = fs.createWriteStream(path, {flags: 'w'});
        writer.write(JSON.stringify(details));
        return true;
    }catch(e){
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
            return await axios({
                url: `https://api.igdb.com/v4/${types[typeId]}`,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': process.env.CLIENT_ID,
                    'Authorization': `Bearer ${token}`,
                },
                data: `fields name; where id = (${id});`
            }).then(response => response.data.map(e => {return { ...e, "type": types[typeId]}}));
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

const _searchGameDetails = (search, token) => {

    return axios({
        url: "https://api.igdb.com/v4/games",
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${token}`,
        },
        data: `fields category, total_rating, rating, tags, involved_companies.company.name, involved_companies.company.logo.url, name, cover.url, screenshots.url, summary, videos.video_id; where platforms = (8) & name ~ *"${search}"*;`
    })
        .then(response => response.data.map(e => {
            return {
                ...e,
                "cover": {"url": e?.cover?.url?.replace("t_thumb", "t_cover_big")},
                "screenshots": e?.screenshots?.map(s => {
                    return {...s, "url": s.url.replace("t_thumb", "t_original")}
                })
            }
        }))
        .catch(err => {
            console.log(err);
            return [];
        });
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
    return name.replace(regex, "").replace(regex1, "").trim().replace(regex2, "-");
}

const parseName = (name) => {
    const regex = /(\(.*?\)|(.zip))/gm;
    name = name.replace(regex, "");
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
        const {search} = req.params;

        let game = {};
        const detailPath = `${gamesDirectory}/${parseDirectory(search)}/details.json`;
        if(fs.existsSync(detailPath)){
            try{
                const details = fs.readFileSync(detailPath, "utf-8");
                game = JSON.parse(details);
            }catch(e){
                console.log(e);
            }
        }
        else{
            const searchArray = search.split(/-| /).map(e => e.trim());
            token = (!token) ? await authenticate(token) : token;

            let response = await _searchGameDetails(search, token);
            response = response.map(game => { return{
                ...game,
                matchPercentage: stringsSimilarityPercentage(game.name, search)
            }});
            if (response.length === 0 && searchArray !== 0) {
                response = [];
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
                        let informations = JSON.parse(fs.readFileSync(`${gamesDirectory}/${folder}/${process.env.INFORMATIONS_FILENAME}`,"utf-8"));
                        if ("state" in informations && informations.state === "downloaded") {
                            games.push(informations);
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
        try {
            token = (!token) ? await authenticate(token) : token;
            result = await axios({
                url: `https://api.igdb.com/v4/genres`,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': process.env.CLIENT_ID,
                    'Authorization': `Bearer ${token}`,
                },
                data: `fields name; sort id asc; limit 500;`
            }).then(response => response.data);
        } catch (e) {
            console.log(e);
            result = [];
        }
        res.send({
            "genres": result
        });
    }

    module.searchByGenre = async (req,res) => {
        const { genres } = req.query;
        const igdbGames = [];
        let tempGames = [];
        token = (!token) ? await authenticate(token) : token;
        while( igdbGames.length === 0 || tempGames.length !== 0){
            tempGames = await axios({
                url: "https://api.igdb.com/v4/games",
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': process.env.CLIENT_ID,
                    'Authorization': `Bearer ${token}`,
                },
                data: `fields name; where platforms = (8) & genres = (${genres.join(",")}); limit 50; offset ${igdbGames.length};`
            })
                .then(response => response.data.map(e => {
                    return {
                        ...e,
                        "cover": {"url": e?.cover?.url?.replace("t_thumb", "t_cover_big")},
                        "screenshots": e?.screenshots?.map(s => {
                            return {...s, "url": s.url.replace("t_thumb", "t_original")}
                        })
                    }
                }))
                .catch(err => {
                    console.log(err);
                    tempGames = [];
                });
            igdbGames.push(...tempGames);
        }
        const newGameList = await _getNewGameList(token);
        if(newGameList.type === "error"){
            res.send(newGameList);
            return;
        }
        const result = [];
        for(let i of igdbGames){
            for(let y of newGameList.value){
                if(stringsSimilarityPercentage(i.name, y.name) >= process.env.MATCH_PERCENTAGE_THREESOLD){
                    result.push(y);
                    break;
                }
            }
        }
        res.send({
            "games": result
        });
    }

    return module;
}
