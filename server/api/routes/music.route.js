module.exports = (app, spotifyToken) => {
    const music = require("../controllers/music.controller")(app, spotifyToken);
    const router = require("express").Router();

    router.post("/search", music.spotifySearch);
    router.post("/", music.getMp3Link)

    app.use('/api/musics', router);
};