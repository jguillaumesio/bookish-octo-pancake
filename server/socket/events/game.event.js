const gameController = require("./../controllers/game.controller");
module.exports = (socket) => {
    socket.on('downloadGame', ({url, emulator, data}) => {
        gameController.downloadGame(url, emulator, data, socket);
    });
}