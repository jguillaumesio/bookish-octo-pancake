const fs = require("fs");
const axios = require("axios");
const {stringsSimilarityPercentage} = require("./../../utils");
const path = require("path");

const _findByEmulator = emulator => {
    const directory = `${appRoot}/public/games/${emulator}`;
    let games = [];
    let files;
    let result;
    if (fs.existsSync(directory)) {
        try {
            files = fs.readdirSync(directory);
            files.forEach(folder => {
                if (fs.lstatSync(`${directory}/${folder}`).isDirectory()) {
                    let informations = JSON.parse(fs.readFileSync(`${directory}/${folder}/${process.env.INFORMATIONS_FILENAME}`));
                    if (informations.downloaded) {
                        games.push(informations);
                    }
                }
            });
            result = {
                type: 'success',
                value: games
            };
        } catch (e) {
            result = {
                type: 'error',
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

const _searchGameDetails = (search, token) => {
    return axios({
        url: "https://api.igdb.com/v4/games",
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${token}`,
        },
        data: `fields name, cover.url, screenshots.url, summary, videos.video_id; where platforms = (8) & name ~ *"${search}"*;`
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

const keepBestMatch = (matches, toMatch) => {
    matches = matches.map(e => {
        return {
            matchPercentage: (e.name) ? stringsSimilarityPercentage(e.name, toMatch) : 0,
            ...e
        }
    });
    return matches.reduce((bestMatch, element) => (element.matchPercentage > bestMatch.matchPercentage) ? element : bestMatch, matches[0]);
}

module.exports = (app, token) => {
    const module = {};
    module.searchGameDetails = async (req, res) => {
        const {search} = req.params;
        const searchArray = search.split("-").map(e => e.trim());
        token = (!token) ? await authenticate(token) : token;

        let response = await _searchGameDetails(search, token);
        let i = 0;
        if (response.length === 0 && searchArray !== 0) {
            response = [];
            for (let i of searchArray) {
                const result = await _searchGameDetails(i, token);
                response.push(...result);
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
