const games = require("../controllers/game.controller.js")();

module.exports = (socket) => {
    socket.on('launchGame', async ({gamePath}) => {
        await games.launchGame(gamePath, socket);
    });
    socket.on('download', async ({url, directory, name}) => {
        await games.download(url, directory, name, socket);
    });
}