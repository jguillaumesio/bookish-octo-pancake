const axios = require("axios");
const puppeteer = require('puppeteer-extra');

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