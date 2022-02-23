const HTMLParser = require('node-html-parser');
const fs = require("fs");
const axios = require("axios");
const path = require('path');
const Seven = require('node-7z');
const sevenBin = require('7zip-bin');
const pathTo7zip = sevenBin.path7za;
const {replaceAll, addToJSONFile} = require('./../../utils');
const request = require('request');

const uncompress = (file) => {
    let toRename = [];
    const directory = path.dirname(file);
    const myStream = Seven.extractFull(file, directory,{
        $bin: pathTo7zip,
        $progress: true
    });
    myStream.on('data', function (data) {
        if(data.status === 'extracted'){
            const extension = path.parse(data.file).base.split('.').pop();
            toRename.push({
                oldFile: `${directory}/${data.file}`,
                newFile: `${directory}/game.${extension}`
            });
        }
    })
    myStream.on('progress', extracted => console.log(extracted));
    myStream.on('end', () => {
        fs.unlink(file, () => {console.log('deleted');});
        toRename.forEach( file => {
            fs.rename( file.oldFile, file.newFile, e => { console.log(e) });
        });
        addToJSONFile(`${directory}/${process.env.INFORMATIONS_FILENAME}`, {downloaded:true});
    });
    myStream.on('error', e => console.log(e))
}

const download = async (fileUrl, formData, data, emulator, socket) => {
    const options = {
        'method': 'POST',
        'url': fileUrl,
        'headers': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': ' gzip, deflate, br',
            'Accept-Language': ' fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': ' max-age=0',
            'Connection': ' keep-alive',
            'Content-Type': ' application/x-www-form-urlencoded',
            'Cookie': ' _ga=GA1.2.792577390.1644525674; _gid=GA1.2.766110.1644698277; _gat_gtag_UA_120661049_1=1',
            'Host': new URL(fileUrl).host,
            'Origin': ' https://wowroms.com/',
            'Referer': ' https://wowroms.com/',
            'sec-ch-ua': ' " Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
            'sec-ch-mobile': ' ?0',
            'sec-ch-ua-platform': ' "Windows"',
            'Sec-Fetch-Dest': ' document',
            'Sec-Fetch-Mode': ' navigate',
            'Sec-Fetch-Site': ' same-site',
            'Upgrade-Insecure-Requests': ' 1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36'
        },
        formData: formData
    };

    data.name = replaceAll(data.name, ['\n','\t',':',' '], ['','','-','-']);
    const directory = `${appRoot}/public/games/${emulator}/${data.name}`;
    if (!fs.existsSync(directory)){
        fs.mkdirSync(directory, { recursive: true });
        fs.writeFileSync(`${directory}/${process.env.INFORMATIONS_FILENAME}`, JSON.stringify(data));
    }
    let filePath;
    await new Promise((resolve, reject) => {
        let stream = request(options);
        stream.on('response',res => {
            const total = res.headers['content-length'];
            const fileName = res.headers['content-disposition'].substring(
                res.headers['content-disposition'].indexOf('"') + 1,
                res.headers['content-disposition'].lastIndexOf('"')
            );
            filePath = `${directory}/${fileName}`;
            const file = fs.createWriteStream(filePath);
            let percentage = 0;
            const tracking = setInterval(()=>{
                const newPercentage = parseInt(fs.statSync(filePath).size/total * 100).toFixed(0);
                if(percentage !== newPercentage){
                    percentage = newPercentage;
                    socket.emit("downloadTracking",{percentage: percentage});
                }
                if(percentage == 100){
                    clearInterval(tracking);
                    resolve();
                }
            },1000);
            res.pipe(file);
        });
    });

    uncompress(filePath, emulator);
}

exports.downloadGame = async (url, emulator, data, socket) => {
    const root = "https://wowroms.com";
    let page = await axios.get(url).then(res => res.data);
    page = HTMLParser.parse(page);
    url = `${root}${page.querySelectorAll('.btnDwn')[0].getAttribute('href')}`;

    const [k,t] = ['1644786000232','a94d7ed8bf67960976f32817ca44795e'];
    page = await axios.get(url).then(res => res.data);
    url = page.toString().match(/(var ajaxLinkUrl)(.*?)"(.*?)(")/g)[0];
    url = `${root}${url.substring(url.indexOf('"') + 1,url.lastIndexOf('"'))}?k=${k}&t=${t}`;
    const formData = {};
    for(let i of HTMLParser.parse(page).querySelectorAll('#submitForm')[0].querySelectorAll('input')){
        formData[i.getAttribute('name')] = i.getAttribute('value');
    }

    let postingUrl = await axios.post(url).then(res => res.data);
    postingUrl = JSON.parse(JSON.stringify(postingUrl)).link;
    await download(postingUrl, formData, data, emulator, socket);
}