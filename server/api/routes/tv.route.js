module.exports = (app) => {
    const tv = require("../controllers/tv.controller.js")(app);
    const router = require("express").Router();

    router.get("/", tv.test);

    app.use('/api/tv', router);
};