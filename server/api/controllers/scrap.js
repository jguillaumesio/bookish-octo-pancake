const fs = require("fs");
const axios = require("axios");
const request = require("request");
const yauzl = require("yauzl");

const unzip = async (path) => {
    yauzl.open("path", {lazyEntries: true}, (err, zipfile) => {
        if (err) throw err;
        zipfile.readEntry();
        zipfile.on("entry", (entry) => {
            if (/\/$/.test(entry.fileName)) {
                // Directory file names end with '/'.
                // Note that entires for directories themselves are optional.
                // An entry's fileName implicitly requires its parent directories to exist.
                zipfile.readEntry();
            } else {
                // file entry
                zipfile.openReadStream(entry, (err, readStream) => {
                    if (err) throw err;
                    readStream.on("end", () => {
                        zipfile.readEntry();
                    });
                    readStream.pipe(somewhere);
                });
            }
        });
    });
}

exports.download = async (req, res) => {
    const url = "https://archive.org/download/PS2_COLLECTION_PART2/Ben%2010%20-%20Ultimate%20Alien%20-%20Cosmic%20Destruction%20%28Europe%29%20%28En%2CFr%2CDe%2CEs%2CIt%29.zip";
    const emulator = "ps2";
    const directory = `${appRoot}/public/games/${emulator}`;
    let filePath;
    await new Promise((resolve, reject) => {
        let stream = request({'url': url});
        stream.on('response',res => {
            const total = res.headers['content-length'];
            const fileName = "test.zip";
            filePath = `${directory}/${fileName}`;
            const file = fs.createWriteStream(filePath);
            let percentage = 0;
            const tracking = setInterval(()=>{
                const newPercentage = parseInt(fs.statSync(filePath).size/total * 100).toFixed(0);
                if(percentage !== newPercentage){
                    percentage = newPercentage;
                    console.log(percentage);
                    //socket.emit("downloadTracking",{percentage: percentage});
                }
                if(percentage === 100){
                    clearInterval(tracking);
                    resolve();
                }
            },1000);
            res.pipe(file);
        });
    });
}