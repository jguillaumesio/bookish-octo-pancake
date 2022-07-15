module.exports = (app,token) => {
    const games = require("../controllers/game.controller.js")(token);
  
    const router = require("express").Router();

    router.get("/genres",games.getGenres);
    router.post("/genres",games.searchByGenre);
    router.get("/new", games.getNewGameList);
    router.get("/refresh", games.refreshNewGameList);
    router.post("/details", games.searchGameDetails);
    router.get("/", games.getGames);
  
    app.use('/api/games', router);
  };