module.exports = (app,token) => {
    const games = require("../controllers/game.controller.js")(token);
    const pad = require("../controllers/pad.controller.js")(token);

    const router = require("express").Router();

    router.get("/generateGameDetails", games.generateAllDetails);
    router.get("/pad", pad.installPad);

    app.use('/installation', router);
};