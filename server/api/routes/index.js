module.exports = (app,token) => {
    const games = require("../controllers/game.controller.js")(token);
  
    const router = require("express").Router();

    router.get("/:emulator/details/:search", games.searchGameDetails);
    router.get("/:emulator/new", games.findNewByEmulator);
    router.get("/:emulator", games.findByEmulator);
  
    app.use('/api/games', router);
  };