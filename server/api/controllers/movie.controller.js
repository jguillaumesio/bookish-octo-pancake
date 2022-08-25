const axios = require("axios");
const HTMLParser = require("node-html-parser");
const dns = require("native-dns");
const net = require("net");
const URL = require ("url");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const {stringsSimilarityPercentage} = require("../../utils");

const getCover = async title => {
    let moviesCover = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${title}&include_adult=true`).then(res => res.data.results);
    moviesCover = [...moviesCover].reduce((a,b) =>
            (stringsSimilarityPercentage(a.original_title , title) > stringsSimilarityPercentage(b.original_title , title))
                ? a
                : b
        ,moviesCover[0]);
    if(moviesCover !== null && moviesCover !== undefined && moviesCover !== "" && "poster_path" in moviesCover && moviesCover.poster_path !== null){
        moviesCover = `https://image.tmdb.org/t/p/original/${moviesCover.poster_path}`;
    }
    else{
        moviesCover = `${process.env.API_URL}/movies/no-poster.png`
    }
    return moviesCover;
}

const parseMoviesFromEmpirePage = async (link, selector = ".card-custom-4") => { //card-web for categories
    const result = [];

    try{
        puppeteer.use(StealthPlugin());
        const browser = await puppeteer.launch({
            product: "chrome",
            executablePath:  `${appRoot}/public/puppeteer/chrome/chrome.exe`,
            userDataDir: `${appRoot}/public/puppeteer/tmp`,
            args: [
                '-wait-for-browser'
            ],
            headless: false
        });
        const page = await browser.newPage()
        await page.goto(link)
        await page.waitForSelector("#body_content_empire")
        const content = await page.content();
        for(const movie of HTMLParser.parse(content.toString()).querySelectorAll(selector)){
            const obj = {
                "title": movie.querySelectorAll("h3")[0].rawText.trim(),
                "link": `https://empire-streaming.co/${movie.querySelectorAll("a")[0].getAttribute("href")}`,
                "type": (`https://empire-streaming.co/${movie.querySelectorAll("a")[0].getAttribute("href")}`.includes("film")) ? "FILM" : "SÉRIE"
            };
            if(obj.title !== null && obj.title !== ""){
                const cover = await getCover(obj.title);
                obj.cover = cover;
            }
            result.push(obj);
        }
        await browser.close();
        return {
            type:"success",
            value: result
        };
    }catch(e){
        console.log(e);
        return {
            type:"error",
            value: null
        };
    }
}

const resolveARecord = (hostname, dnsServer) => {
    return new Promise(function (resolve, reject) {
        const question = dns.Question({
            name: hostname,
            type: "A"
        });
        const request = dns.Request({
            question: question,
            server: { address: dnsServer, port: 53, type: "udp" },
            timeout: 10000
        });
        request.on("timeout", function () {
            reject(new Error("Timeout in making request"));
        });
        request.on("message", function (err, response) {
            for (var i in response.answer) {
                if (response.answer[i].address) {
                    resolve(response.answer[i]);
                    break;
                }
            }
        });
        request.on("end", function () {
            reject(new Error("Unable to resolve hostname"));
        });
        request.send();
    });
}
const parseVKStreamingLink = async link => {
    axios.interceptors.request.use(function (config) {
        var url = URL.parse(config.url);

        if (!config.dnsServer || net.isIP(url.hostname)) {
            // Skip
            return config;
        } else {
            return resolveARecord(url.hostname, config.dnsServer).then(function (response) {
                config.headers = config.headers || {};
                config.headers.Host = url.hostname; // put original hostname in Host header

                url.hostname = response.address;
                delete url.host; // clear hostname cache
                config.url = URL.format(url);

                return config;
            });
        }
    });
    try{
        const page = await axios.get(link, {
            headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"},
            dnsServer: '1.1.1.1'
        }).then(res => res.data);

        return {
            type:"success",
            value: [...HTMLParser.parse(page.toString()).querySelectorAll(".movie-preview-content")].map(e => {
                const titleLink = e.querySelectorAll(".movie-title")[0];
                return {
                    "name": titleLink.rawText.replaceAll(/\n/g, ""),
                    "link": titleLink.querySelectorAll("a")[0].getAttribute("href"),
                    "cover": e.querySelectorAll("img")[0].getAttribute("src")
                }
            })
        };
    }catch(e){
        console.log(e);
        return {
            type:"error",
            value: null
        }
    }
}
const parseStreamWayStreamingLink = async link => {
    axios.interceptors.request.use(function (config) {
            var url = URL.parse(config.url);

            if (!config.dnsServer || net.isIP(url.hostname)) {
                // Skip
                return config;
            } else {
                return resolveARecord(url.hostname, config.dnsServer).then(function (response) {
                    config.headers = config.headers || {};
                    config.headers.Host = url.hostname; // put original hostname in Host header

                    url.hostname = response.address;
                    delete url.host; // clear hostname cache
                    config.url = URL.format(url);

                    return config;
                });
            }
        });
    try{
        const page = await axios.get(link, {
            headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"},
            dnsServer: '1.1.1.1'
        }).then(res => res.data);

        const movies = [...HTMLParser.parse(page.toString()).querySelectorAll(".TPost.B")]
        for(let i in movies){
            const title = movies[i].querySelectorAll(".Title")[0];
            const cover = movies[i].querySelectorAll("img")[0];

            movies[i] = {
                "title": title.rawText,
                "cover": `https://wvw.streamay.to${cover.getAttribute("src")}`
            }
        }

        return {
            "type":"success",
            "value": movies
        };
    }catch(e){
        console.log(e);
        return {
            "type":"error",
            "value": null
        }
    }
}
const parseEmpireStreamingLink = async (link, type) => {
    let result = [];
    const parseLink = obj => {
        const result = {
            "version": obj.version
        }
        switch (obj.property) {
            case "streamsb":
                result.player = "streamsb";
                result.link = `https://playersb.com/e/${obj.code}`;
                break;
            case "doodstream":
                result.player = "dood";
                result.link = `https://dood.pm/e/${obj.code}`;
                break;
            case "voe":
                result.player = "voe";
                result.link = `https://voe.sx/e/${obj.code}`;
                break;
        }
        return result;
    }
    try{
        puppeteer.use(StealthPlugin());
        const browser = await puppeteer.launch({
            product: "chrome",
            executablePath:  `${appRoot}/public/puppeteer/chrome/chrome.exe`,
            userDataDir: `${appRoot}/public/puppeteer/tmp`,
            args: [
                '-wait-for-browser'
            ],
            headless: false
        });
        const regex = (type === "FILM") ? new RegExp(/const result = (\[.*?\]);/gms) : new RegExp(/const result = ({.*?});/gms);
        const page = await browser.newPage();
        await page.goto(link)
        await page.waitForSelector(".block-overlay-bottom")
        let content = await page.content();
        if(type === "FILM"){
            result = [...result, ...JSON.parse(regex.exec(content)[1]).map(e => parseLink(e))]
        }
        else{
            result = JSON.parse(regex.exec(content)[1]);
            result = Object.values(result).map(value => {
                value.sort((a,b) => (a.episode < b.episode) ? -1 : 1);
                return value;
            });
            for(const season of result){
                for(let episodeIndex in season){
                    const videos = [];
                    for(const video of season[episodeIndex].video){
                        videos.push(parseLink(video));
                    }
                    season[episodeIndex] = {
                        saison: season[episodeIndex].saison,
                        episode: season[episodeIndex].episode,
                        videos: videos
                    }
                }
            }
        }
        await browser.close();
        return result;
    }catch(e){
        console.log(e);
        return result;
    }
}
const getVoePlayerSrc = async link => {
    let result = null;
    let browser = null;
    try{
        puppeteer.use(StealthPlugin());
        browser = await puppeteer.launch({
            product: "chrome",
            executablePath:  `${appRoot}/public/puppeteer/chrome/chrome.exe`,
            userDataDir: `${appRoot}/public/puppeteer/tmp`,
            args: [
                '-wait-for-browser'
            ],
            headless: false
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on("request", async (r) => {
            if (r.url().includes("voe-network") && (r.url().includes("mp4") || r.url().includes("m3u8"))) {
                result = r.url();
            }
            r.continue();
        });
        await page.goto(link);
    }catch(e){
        console.log(e);
        return null;
    }
    while(result === null){
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    if(browser !== null){
        await browser.close();
    }
    return result;
}
const getDoodPlayerSrc = async link => {
    let result = null;
    let browser = null;
    try{
        puppeteer.use(StealthPlugin());
        browser = await puppeteer.launch({
            product: "chrome",
            executablePath:  `${appRoot}/public/puppeteer/chrome/chrome.exe`,
            userDataDir: `${appRoot}/public/puppeteer/tmp`,
            args: [
                '-wait-for-browser'
            ],
            headless: false
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on("request", async (r) => {
            if (r.url().includes("dood.video") && r.url().includes("token")) {
                result = r.url();
            }
            r.continue();
        });
        await page.goto(link);
        await page.waitForSelector(".vjs-big-play-button");
        await page.evaluate(() => {
            document.getElementsByClassName("vjs-big-play-button")[0].click();
        });
    }catch(e){
        console.log(e);
        return null;
    }
    while(result === null){
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    if(browser !== null){
        await browser.close();
    }
    return result;
}
const getSbStreamPlayerSrc = async link => {
    let result = null;
    let browser = null;
    try{
        puppeteer.use(StealthPlugin());
        browser = await puppeteer.launch({
            product: "chrome",
            executablePath:  `${appRoot}/public/puppeteer/chrome/chrome.exe`,
            userDataDir: `${appRoot}/public/puppeteer/tmp`,
            args: [
                '-wait-for-browser'
            ],
            headless: false
        });
        const page = await browser.newPage();
        page.on("response", async (response) => {
            if (response.url().includes("master.m3u8")) {
                result = await response.text();
                const regex = new RegExp(/#EXT-X-STREAM.*?RESOLUTION=(.*?),.*?FRAME-RATE=(.*?),.*?\n(.*?)\n/gm)
                console.log(result);
                result = [...result.matchAll(regex)];
                result = result.reduce((a,b) => {
                    if(b.length === 4){
                        if(parseInt(a[1].split("x")[0]) < parseInt(b[1].split("x")[0])){
                            return b;
                        }
                        else if(a[1].split("x")[0] === b[1].split("x")[0]){
                            return (parseFloat(a[2]) > parseFloat(b[2])) ? a : b;
                        }
                        return a;
                    }
                    return a;
                },result[0]);
                result = result[3];
            }
            const maPromesse = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('toto');
                }, 300000);
            });
            await maPromesse;
        });
        await page.goto(link);
        await page.waitForSelector(".jw-icon.jw-icon-display.jw-button-color.jw-reset");
        await page.evaluate(() => {
            document.querySelectorAll(".jw-icon.jw-icon-display.jw-button-color.jw-reset")[0].click();
        });
        //TODO get page response to wait for master.m3u8 response
    }catch(e){
        console.log(e);
        return null;
    }
    while(result === null){
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    await browser.close();
    return result;
}

module.exports = (app) => {
    const module = {};
    module.getPlayerSrc = async (req,res) => {
        let { link, type } = req.body;
        if(!("link" in req.body)){
            res.send({
                type:"error",
                value: "Missing link in req.body"
            });
            return;
        }
        const streamingLinks = await parseEmpireStreamingLink(link, type);
        if((type === "FILM" && streamingLinks.length === 0)){
            res.send({
                type:"error",
                value: null
            });
            return;
        }
        let result = [];
        if(type === "FILM"){
            for(const streamingLink of streamingLinks){
                let newLink = null;
                switch(streamingLink.player){
                    case "streamsb":
                        newLink = await getSbStreamPlayerSrc(streamingLink.link);
                        break;
                    case "voe":
                        newLink = await getVoePlayerSrc(streamingLink.link);
                        break;
                    case "dood":
                        newLink = await getDoodPlayerSrc(streamingLink.link)
                        break;
                }
                if(newLink !== null){
                    result.push({
                        ...streamingLink,
                        "link":newLink
                    });
                }
            }
        }
        else{
            for(const season of streamingLinks){
                for(const episode of season){
                    for(let video of episode.videos){
                        let newLink = null;
                        switch(video.player){
                            case "streamsb":
                                newLink = await getSbStreamPlayerSrc(video.link);
                                break;
                            case "voe":
                                newLink = await getVoePlayerSrc(video.link);
                                break;
                            case "dood":
                                newLink = await getDoodPlayerSrc(video.link)
                                break;
                        }
                        if(newLink !== null){
                            video = {
                                ...video,
                                "link": newLink
                            }
                        }
                    }
                }
            }
            result = Object.keys(streamingLinks).map(i => streamingLinks[i]);
        }
        if(result.length === 0){
            res.send({
                type:"error",
                value: null
            });
            return;
        }
        res.send({
            type:"success",
            value: result
        });
    }
    module.getSerieEpisodes = async (req, res) => {
        let { link } = req.body;
        if(!("link" in req.body)){
            res.send({
                type:"error",
                value: "Missing link in req.body"
            });
            return;
        }
        const streamingLinks = await parseEmpireStreamingLink(link, "SERIE");
        const result = Object.keys(streamingLinks).map(i => streamingLinks[i]).map(e => e.reduce((a,b) => {
            a[b.saison] = (!(b.saison in a)) ? [{"episode": b.episode, "videos": b.videos}] : [...a[b.saison], {"episode": b.episode, "videos": b.videos}];
           return a;
        },{}));
        if(result.length === 0){
            res.send({
                type:"error",
                value: null
            });
            return;
        }
        res.send({
            type:"success",
            value: result.map(e => Object.values(e)[0].sort((a,b) => a.episode >= b.episode ? 1 : -1).map(e => e.videos))
        });
    }
    module.getNewMovies = async (req, res) => {
        const result = await parseMoviesFromEmpirePage("https://empire-streaming.co/");
        res.send(result);
    }
    module.search = async (req, res) => {
        const {search} = req.body;
        try{
            const result = await axios.post("https://empire-streaming.co/api/views/search",JSON.stringify({"search": search}),{
                headers:{
                    "Content-Type":"application/json;charset=UTF-8"
                }
            }).then(res => res.data);
            if("status" in result && result.status){
                const movies = [];
                for(let e of (result.data["films"] ?? [])){
                    const cover = await getCover(e.title);
                    movies.push({
                        "title": e.title,
                        "cover": cover,
                        "link": `https://empire-streaming.co/${e.urlPath}`
                    });
                }
                res.send({
                    type:"success",
                    value: movies
                });
            }
            else{
                res.send({
                    type:"error",
                    value:null
                });
            }
        }catch(e){
            console.log(e);
            res.send({
                type:"error",
                value:null
            });
        }
    }
    return module;
}