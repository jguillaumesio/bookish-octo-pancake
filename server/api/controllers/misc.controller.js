const robot = require("robotjs");
const {logError} = require("server/utils");

module.exports = (app) => {
    const module = {};
    module.clickOnScreen = async (req, res) => {
        const x = req.body.x ?? 0;
        const y = req.body.y ?? 0;
        try{
            robot.moveMouse(x,y);
            robot.mouseClick("left", true);
            res.send({
                type:"success",
                value:null
            });
        }catch(e){
            logError("game.controller.js",e);
            res.send({
                type:"error",
                value:null
            });
        }
    }
    return module;
}
