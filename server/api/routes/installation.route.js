module.exports = (app, igdbToken) => {
    const games = require("../controllers/game.controller.js")(igdbToken);
    const pad = require("../controllers/pad.controller.js")(igdbToken);

    const router = require("express").Router();

    router.get("/generateGameDetails", games.generateAllDetails);
    router.get("/pad", pad.installPad);

    app.use('/installation', router);
};