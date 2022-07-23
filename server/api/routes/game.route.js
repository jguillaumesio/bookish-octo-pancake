module.exports = (app,token, downloads) => {
    const games = require("../controllers/game.controller.js")(app, token, downloads);
  
    const router = require("express").Router();

    router.get("/genres",games.getGenres);
    router.post("/genres",games.searchByGenre);
    router.get("/new", games.getNewGameList);
    router.get("/refresh", games.refreshNewGameList);
    router.get("/downloadsToResume",games.downloadsToResume);
    router.post("/details", games.searchGameDetails);
    router.post("/search", games.searchGameByName)
    router.get("/", games.getGames);
  
    app.use('/api/games', router);
  };