module.exports = (app) => {
    const misc = require("../controllers/misc.controller.js")(app);

    const router = require("express").Router();

    router.post("/click", misc.clickOnScreen);

    app.use('/api/misc', router);
};