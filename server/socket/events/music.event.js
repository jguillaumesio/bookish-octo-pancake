const music = require("../controllers/music.controller.js")();

module.exports = (socket) => {
    socket.on('downloadMusic', async ({url}) => {
        await music.download(url, socket);
    });
}