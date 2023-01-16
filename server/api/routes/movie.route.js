module.exports = (app) => {
    const movies = require("../controllers/movie.controller.js")(app);

    const router = require("express").Router();

    router.get("/new", movies.getNewMovies);
    router.post("/getLinks", movies.getPlayerSrc);
    router.post("/getLinksFromPlayer", movies.getSrcFromPlayerLink)
    router.post("/getSerieEpisodes", movies.getSerieEpisodes)
    router.post("/search", movies.search);

    app.use('/api/movies', router);
};