const axios = require("axios");
const qs = require("qs");
const HTMLParser = require("node-html-parser");
const dns = require("native-dns");
const net = require("net");
const URL = require ("url");
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

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
            const link = movies[i].querySelectorAll("a")[0];
            const cover = movies[i].querySelectorAll("img")[0];

            const moviePage = await axios.get(`https://wvw.streamay.to${link.getAttribute("href")}`, {
                headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"},
                dnsServer: '1.1.1.1'
            }).then(res => res.data);

            movies[i] = {
                "name": title.rawText,
                "links": [...HTMLParser.parse(moviePage.toString()).querySelectorAll("iframe")].map(e => `https://wvw.streamay.to${e.getAttribute("src")}`),
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
const parseEmpireStreamingLink = async link => {
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
            headless: true
        });
        const regex = new RegExp(/const result = (\[.*?\]);/gms);
        const page = await browser.newPage()
        await page.goto(link)
        await page.waitForSelector(".block-overlay-bottom")
        let content = await page.content();
        result = [...result, ...JSON.parse(regex.exec(content)[1]).map(e => parseLink(e))];
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
            if (r.url().includes("voe-network") && r.url().includes("mp4")) {
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
            headless: true
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on("request", async (r) => {
            if (r.url().includes("sources")) {
                result = await axios.get(r.url()).then(res => res.data["stream_data"].file);
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

module.exports = (app) => {
    const module = {};
    module.getPlayerSrc = async (req, res) => {
        let { link } = req.body;
        const streamingLinks = await parseEmpireStreamingLink(link);
        if(streamingLinks.length === 0){
            res.send({
                type:"error",
                value: null
            });
            return;
        }
        let result = [];
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
    module.getNewMovies = async (req, res) => {
        const result = await parseStreamWayStreamingLink('https://wvw.streamay.to/');
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
                const movies = (result.data["films"] ?? []).map(e => {
                    return {
                        "title": e.title,
                        "cover": `https://empire-streaming.co${e.image[0].path}`,
                        "link": `https://empire-streaming.co/${e.urlPath}`
                    }
                });
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
            res.send({
                type:"error",
                value:null
            });
        }
    }
    return module;
}