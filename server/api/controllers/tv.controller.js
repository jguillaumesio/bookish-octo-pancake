const axios = require("axios");
const HTMLParser = require("node-html-parser");
const dns = require("native-dns");
const net = require("net");
const URL = require ("url");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

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
    module.getChannels = async (req,res) => {
        let result = null;
        let browser = null;
        const max = [99,99];
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
        await page.goto("https://leet365.cc/fr/6/19");
        page.on('response', async response => console.log(await response.text()))

    }
    return module;
}