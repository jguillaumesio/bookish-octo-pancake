module.exports = (app) => {
    const music = require("../controllers/music.controller")(app);

    const router = require("express").Router();

    router.post("/search", music.search);

    app.use('/api/music', router);
};