module.exports = app => {
    const games = require("../controllers/game.controller.js");
  
    const router = require("express").Router();

    //Find new games
    router.get("/:emulator/new", games.findNewByEmulator);

    // Get all games from a given emulator
    router.get("/:emulator", games.findByEmulator);
  
    app.use('/api/games', router);
  };