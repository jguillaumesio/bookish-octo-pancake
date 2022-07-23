const fs = require("fs");
const axios = require("axios");

const musicsDirectory = `${appRoot}/public/music`;

module.exports = () => {
    const module = {};

    module.download1 = async (url, socket) => {
        const filePath = `${musicsDirectory}/${Date.now()}.mp3`;
        let writer = fs.createWriteStream(filePath, {"flags": "a"});
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        }).then(response => response);
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                fs.rmSync(filePath);
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                    socket.emit("downloadMusic",JSON.stringify({"data": fs.readFileSync(filePath)}));
                }
            });
        });
    }

    module.download = async (url, socket) => {
        const filePath = `${musicsDirectory}/${Date.now()}.mp3`;
        const responseStream = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        }).then(response => response.data);
        return new Promise((resolve, reject) => {
            responseStream.on("data",(data) => {
                socket.emit("downloadMusic",data)
            })
        });
    }

    return module;
}