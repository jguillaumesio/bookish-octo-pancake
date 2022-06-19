module.exports = (app,token) => {
    const games = require("../controllers/game.controller.js")(token);
  
    const router = require("express").Router();

    router.get("/new", games.getNewGameList);
    router.get("/refresh", games.refreshNewGameList);
    router.get("/details/:search", games.searchGameDetails);
    router.get("/", games.getGames);
  
    app.use('/api/games', router);
  };