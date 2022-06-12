const HTMLParser = require('node-html-parser');
const fs = require("fs");
const axios = require("axios");
const { PS2Repositories } = require("./../../resources/games");
const { stringsSimilarityPercentage } = require("./../../utils");

const parseDirectory = (name) => {
    const regex = /(\(.*?\)|(.zip))/gm;
    const regex1 = /[^a-zA-Z0-9 :]/g;
    const regex2 = /(\s+)/gm;
    name = name.replace(regex, "");
    name = name.replace(regex1, "");
    name = name.trim();
    return name.replace(regex2, "-");
}

const _findByEmulator = emulator => {
    const directory = `${appRoot}/public/games/${emulator}`;
    let games = [];
    let files;
    let result;
    if (fs.existsSync(directory)) {
        try{
            files = fs.readdirSync(directory);
            files.forEach(folder => {
                if (fs.lstatSync(`${directory}/${folder}`).isDirectory()) {
                    let informations = JSON.parse(fs.readFileSync(`${directory}/${folder}/${process.env.INFORMATIONS_FILENAME}`));
                    if(informations.downloaded){
                        games.push(informations);
                    }
                }
            });
            result = {
                type: 'success',
                value: games
            };
        }
        catch(e){
            result = {
                type:'error',
                value: 'Error trying to read the emulator directory'
            }
        }
    } else {
        result = {
            type: 'error',
            value: 'Error reading the emulator directory'
        };
    }
    return result;
}

const authenticate = async (token) => {
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`)
        .then(response => response.data);
    return response["access_token"];
}

const parseName = (name) => {
    const regex = /(\(.*?\)|(.zip))/gm;
    name = name.replace(regex, "");
    return name.trim();
}

const _searchGameDetails = (search, token) => {
    return axios({
        url: "https://api.igdb.com/v4/games",
        method: 'POST',
        headers: {'Accept': 'application/json', 'Client-ID': process.env.CLIENT_ID, 'Authorization': `Bearer ${token}`,},
        data: `fields name; where platforms = (8) & name ~ *"${search}"*;`
    })
        .then(response => response.data)
        .catch(err => {
            console.log(err);
            return [];
        });
}

const keepBestMatch = (matches, toMatch) => {
    matches = matches.map(e => {
        return {
            matchPercentage: stringsSimilarityPercentage(e.name, toMatch),
            ...e
        }
    });
    return matches.reduce( (bestMatch, element) => (element.matchPercentage > bestMatch.matchPercentage) ? element : bestMatch, matches[0]);
}

module.exports = (app,token) => {
    const module = {};
    module.findNewByEmulator = async (req, res) => {
        const emulator = req.params.emulator;

        const games = [];
        for (let repository of PS2Repositories) { //change by emulator
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

        const filteredGames = games.reduce((list, game) => {
            const index = list.findIndex(i => i.name === game.name);
            (index === -1) ? list.push({name: game.name, games: [game]}) : list[index].games.push(game);
            return list;
        }, []);

        res.send({
            type: 'success',
            value: filteredGames
        })
    }
    module.searchGameDetails = async (req, res) => {
        const {search} = req.params;
        const searchArray = search.split("-").map(e => e.trim());
        token = (!token) ? await authenticate(token) : token;

        let response = await _searchGameDetails(search, token);
        let i = 0;
        if(response.length === 0 && searchArray !== 0){
            while (response.length === 0 && i < searchArray.length){
                console.log(searchArray[i]);
                response = await _searchGameDetails(searchArray[i], token);
                i++;
            }
        }



        res.send({
            type: "success",
            value: keepBestMatch(response, search)
        });
    }
    module.findByEmulator = async (req, res) => {
        const emulator = req.params.emulator;
        const result = _findByEmulator(emulator);
        res.send(result);
    }
    return module;
}