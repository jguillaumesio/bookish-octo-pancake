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

module.exports = (app) => {
    const module = {};
    module.test = async (req, res) => {
        const urls = ["https://parsimoniousinvincible.net/embed/ysagetp2j4x",
            "https://parsimoniousinvincible.net/embed/wedpl8t",
            "https://parsimoniousinvincible.net/embed/v2db7kg",
            "https://parsimoniousinvincible.net/embed/91qmzwr",
            "https://parsimoniousinvincible.net/embed/0bsnj0w5s",
            "https://parsimoniousinvincible.net/embed/brilq81faz0axa",
            "https://parsimoniousinvincible.net/embed/tyb9c9jdgtqhn5",
            "https://parsimoniousinvincible.net/embed/xlzl5is",
            "https://parsimoniousinvincible.net/embed/n2u9e0v",
            "https://parsimoniousinvincible.net/embed/aqgtalcjjvrp3"];
        for (const url of urls) {
            console.log(url);
            const text = await axios.get(url).then(res => res.data);
            console.log(text);
        }
        res.send({
            "type":"success",
            value:null
        })
    }
    module.getChannels = async (req,res) => {
        let result = [];
        let current = [1,1];
        let error = [0,0];
        let already = false;
        const browser = await puppeteer.launch({
            product: "chrome",
            executablePath:  `${appRoot}/public/puppeteer/chrome/chrome.exe`,
            userDataDir: `${appRoot}/public/puppeteer/tmp`,
            args: [
                '-wait-for-browser'
            ],
            headless: false
        });
        const page = await browser.newPage();
        page.on('response', async res => {
            //TODO get embed then in embed result UNPACK function(p,a,c,k,e,d)
            const url = res.url();
            if((url.includes("embed") || url.includes("hls")) && already === false){
                already = true;
                //const text = await res.text();
                result.push(url);
                console.log(url);
            }
        });
        while(error[0] < 5){
            while(error[1] < 5){
                const toHave = result.length + 1;
                await page.goto(`https://leet365.cc/fr/${current[0]}/${current[1]}`);
                already = false;
                await new Promise((resolve, _) => setTimeout(() => {
                    if(result.length !== toHave){
                        console.log("error");
                        error[1]++;
                    }
                    else{
                        error[1] = 0;
                    }
                    resolve();
                },2000));
                current[1]++;
            }
            error[0]++;
            error[1] = 0;
            current[1] = 0;
            current[0]++;
        }
        if(browser !== null){
            await browser.close();
        }
        res.send({
            type:"success",
            value: result
        });
    }
    return module;
}