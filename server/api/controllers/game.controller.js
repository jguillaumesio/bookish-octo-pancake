const HTMLParser = require('node-html-parser');
const fs = require("fs");
const axios = require("axios");

exports.findNewByEmulator = async (req, res) => {
    const emulator = req.params.emulator;
    let gameList = _findByEmulator(emulator);
    gameList = (gameList.type === 'success') ? gameList.value : [];

    const root = "https://wowroms.com";
    const url = "https://wowroms.com/en/isos/list/playstation%2B2";
    let games = [];

    let lastPage = false;
    let index = 1;
    while (!lastPage) {
        let page = await axios.get(`${url}?page=${index}`).then(response => response.data);
        page = HTMLParser.parse(page.toString());

        lastPage = parseInt(page.querySelectorAll('.next > a').pop().getAttribute('href').split("=")[1]) === index;

        [...page.querySelectorAll('.element')].forEach(game => {
            const title = game.querySelectorAll('.title-5.heighta')[0];
            const item = {
                name: title.rawText.replace(/  +/g, "").replace("(\\t|\\n)", ""),
                thumbnail: game.getElementsByTagName('img')[0].getAttribute('src').replace('111-111', '705-1000'),
                url: `${root}/${title.getAttribute('href')}`,
            };
            if(gameList.findIndex( n => n.url === item.url) === -1){
                games.push(item);
            }
        })
        index++;
    }
    res.send({
        type: 'success',
        value: games
    })
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

exports.findByEmulator = async (req, res) => {
    const emulator = req.params.emulator;
    const result = _findByEmulator(emulator);
    res.send(result);
}