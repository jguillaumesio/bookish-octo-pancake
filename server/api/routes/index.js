module.exports = (app,token) => {
    const games = require("../controllers/game.controller.js")(token);
  
    const router = require("express").Router();


    router.get("/:emulator/details/:search", games.searchGameDetails);
    //Find new games
    router.get("/:emulator/new", games.findNewByEmulator);

    // Get all games from a given emulator
    router.get("/:emulator", games.findByEmulator);
  
    app.use('/api/games', router);
  };