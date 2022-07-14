module.exports = (app,token) => {
    const games = require("../controllers/game.controller.js")(token);
    const pad = require("../controllers/pad.controller.js")(token);
  
    const router = require("express").Router();

    router.get("/genres",games.getGenres);
    router.post("/genres",games.searchByGenre);
    router.get("/new", games.getNewGameList);
    router.get("/refresh", games.refreshNewGameList);
    router.get("/installPad", pad.installPad);
    router.post("/details", games.searchGameDetails);
    router.get("/generateAllDetails", games.generateAllDetails);
    router.get("/", games.getGames);
  
    app.use('/api/games', router);
  };