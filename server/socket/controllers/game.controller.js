const HTMLParser = require('node-html-parser');
const fs = require("fs");
const axios = require("axios");
const path = require('path');
const yauzl = require("yauzl");
const {PS2Repositories} = require("../../resources/games");
const {mergeFiles} = require('split-file');
const puppeteer = require('puppeteer');
const qs = require("qs");
const {exec} = require("child_process");
const lepikEvents = require('lepikevents');

const generateDownloadChunksHeaders = (total, cookie, directory) => {
    const threads = [];
    const bytesPartitionSize = (process.env.PARTITION_SIZE * 1024 * 1024);
    const numberOfThreads = Math.ceil(total / bytesPartitionSize);//500 Mo per download
    let start = 0;
    for (let i = 0; i < numberOfThreads; i++) {
        const end = (i === numberOfThreads - 1) ? total : start + bytesPartitionSize;
        threads.push({
            percentage: 0,
            weight: end - start,
            path: `${directory}/game${i + 1}.zip`,
            index: i + 1,
            headers: {
                "cookie": cookie,
                "Range": `bytes=${start}-${end}`
            },
            total: end - start
        });
        start = end + 1;
    }
    return threads;
}

const downloadChunk = async (url, thread) => {
    let writer = fs.createWriteStream(thread.path);
    let tracking;
    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        headers: thread.headers
    }).then(response => response);
    return new Promise((resolve, reject) => {
        tracking = setInterval(() => {
            const newPercentage = parseInt(writer.bytesWritten / thread.total * 100).toFixed(0);
            if (thread.percentage !== newPercentage) {
                thread.percentage = newPercentage;
                console.log(`${thread.path}: ${newPercentage}%`);
            }
        }, 1000);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            fs.rmSync(thread.path);
            error = err;
            writer.close();
            reject(err);
        });
        writer.on('close', () => {
            clearInterval(tracking);
            if (!error) {
                resolve(true);
            }
        });
    });
}

const parseDirectory = (name) => {
    const regex = /(\(.*?\)|(.zip))/gm;
    const regex1 = /[^a-zA-Z0-9 :]/g;
    const regex2 = /(\s+)/gm;
    name = name.replace(regex, "");
    name = name.replace(regex1, "");
    name = name.trim();
    return name.replace(regex2, "-");
}

const parseName = (name) => {
    const regex = /(\(.*?\)|(.zip))/gm;
    name = name.replace(regex, "");
    return name.trim();
}

const connectToRepository = async () => {
    let cookies = await axios.get("https://archive.org/services/donations/banner.php").then(res => res.headers["set-cookie"]);
    await axios.get("https://archive.org/account/login", {
        headers: {
            cookie: cookies
        }
    }).then(res => {
        const newCookies = res.headers["set-cookie"];
        cookies = [...cookies, newCookies[0], ...newCookies.slice(newCookies.length - 3, newCookies.length)];
    });

    await axios.post('https://archive.org/account/login', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies.map(cookie => cookie.split("; ")[0]).join("; ")
        },
        data: qs.stringify({
            'submit_by_js': 'false',
            'username': process.env.ARCHIVE_ORG_USERNAME,
            'password': process.env.ARCHIVE_ORG_PASSWORD,
            'referer': 'https://archive.org/',
            'remember': 'true',
            'login': 'true'
        })
    })
        .then(function (response) {
            const newCookie = response.headers["set-cookie"];
            cookies = [...cookies, ...newCookie];
        });

    return cookies.map(cookie => cookie.split("; ")[0]).join("; ")
}

const unZip = async (file, output) => {
    if (!fs.existsSync(output)) {
        fs.mkdirSync(output, {recursive: true});
    }
    yauzl.open(file, {lazyEntries: true}, (err, zipfile) => {
        if (err) throw err;
        zipfile.readEntry();
        zipfile.on("entry", (entry) => {
            if (/\/$/.test(entry.fileName)) {
                zipfile.readEntry();
            } else {
                zipfile.openReadStream(entry, (err, readStream) => {
                    if (err) throw err;
                    readStream.on("end", () => {
                        zipfile.readEntry();
                    });
                    const writer = fs.createWriteStream(`${output}/${entry.fileName}`);
                    readStream.pipe(writer);
                });
            }
        });
    });
}

const filterGames = (games) => {
    return games.reduce((list, game) => {
        const index = list.findIndex(i => i.name === game.name);
        (index === -1) ? list.push({name: game.name, games: [game]}) : list[index].games.push(game);
        return list;
    }, []);
}

module.exports = () => {
    const module = {};

    module.findNewByEmulator = async (socket) => {
        for (let repository of PS2Repositories) { //change by emulator
            const games = [];
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
            socket.emit("getNewGames", JSON.stringify({"games": filterGames(games)}));
        }
        socket.emit("endGetNewGames");
    }
    module.download = async (url, emulator, directory, name, socket) => {
        console.log(url);
        console.log(emulator);
        console.log(directory);
        console.log(name);
        const cookie = await connectToRepository();
        directory = (`${appRoot}/public/games/${emulator}/${directory}`).replace(/\\/g, '/');
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {recursive: true});
        }
        const controller = new AbortController();
        let total;
        await axios({method: 'get', url: url, responseType: "stream", signal: controller.signal}).then(response => {
            total = response.headers['content-length'];
        });
        controller.abort();
        const threads = generateDownloadChunksHeaders(total, cookie, directory);

        //start download process
        fs.writeFileSync(`${directory}/${process.env.INFORMATIONS_FILENAME}`, JSON.stringify({
            "name": name,
            "state": "downloading"
        }));
        //DOWNLOAD PARTITIONS
        try {
            let seconds = 0;
            const timer = setInterval(() => {
                seconds++;
            }, 1000);

            await Promise.all(threads.map(thread => downloadChunk(url, thread)));
            clearInterval(timer);
            console.log(`${total / (1024 * 1024) / seconds}Mo/s en moyenne`);
        } catch (e) {
            console.log(`Error while merging ${directory}/game.zip`);
            console.log(e);
        }
        //MERGING
        try {
            await mergeFiles(threads.map(thread => thread.path), `${directory}/game.zip`);
        } catch (e) {
            console.log(`Error while merging ${directory}/game.zip`);
            console.log(e);
        }

        //REMOVING SPLITTED ZIP
        for (let splittedFilePath of threads.map(thread => thread.path)) {
            try {
                fs.unlinkSync(splittedFilePath);
            } catch (e) {
                console.log(`Error while unlinking ${splittedFilePath}`);
                console.log(e);
            }
        }

        try {
            const filePath = `${directory}/game.zip`;
            await unZip(filePath, directory);
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath);
            }
            const content = fs.readFileSync(`${directory}/${process.env.INFORMATIONS_FILENAME}`, 'utf8');
            fs.writeFileSync(`${directory}/${process.env.INFORMATIONS_FILENAME}`, JSON.stringify({
                ...JSON.parse(content),
                "state": "downloaded"
            }));
        } catch (e) {
            console.log(e);
        }
    }
    module.launchGame = async (gamePath, socket) => {
        const emulatorPath = path.join(appRoot, "public/emulators/pcsx2/pcsx2.exe");
        const command = `${emulatorPath} "${gamePath}" --fullscreen`;
        try {
            exec(command, (error, stdout, stderr) => null);
        } catch (e) {
            console.log(e);
        }

        lepikEvents.events.on('keyPress', async (data) => {
            if (data === "e") {
                try {
                    await new Promise((resolve, reject) => {
                        exec('tasklist | find /i "pcsx2.exe" && taskkill /im pcsx2.exe /F || echo process "pcsx2.exe" not running.', (error, stdout, stderr) => {
                            if (error || stderr) {
                                console.log(error);
                                console.log(stderr);
                                reject(error);
                            }
                        });
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }

    return module;
}