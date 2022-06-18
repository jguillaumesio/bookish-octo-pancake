const games = require("../controllers/game.controller.js")();

module.exports = (socket) => {
    socket.on('launchGame', async ({gamePath}) => {
        console.log(gamePath);
        await games.launchGame(gamePath, socket);
    });
    socket.on('getNewGames', async () => {
        await games.findNewByEmulator(socket);
    });
    socket.on('download', async ({url, emulator, directory, name}) => {
        await games.download(url, emulator, directory, name, socket);
    });
}