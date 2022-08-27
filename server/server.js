require('dotenv').config({path:`${__dirname}/.env`});
const cors = require('cors');

const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: process.env.CLIENT_URL,
    }
});

global.appRoot = __dirname;

let igdbToken = null;
let downloads = {};
let spotifyToken = null;

app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

require("./api/routes/tv.route")(app);
require("./api/routes/music.route")(app, spotifyToken);
require("./api/routes/game.route")(app, igdbToken, downloads);
require("./api/routes/movie.route")(app);
require("./api/routes/misc.route")(app);
require("./api/routes/installation.route")(app, igdbToken);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
    next();
});

io.on("connection", (socket) => {
    console.info(`Socket ${socket.id} has connected.`);

    socket.on("disconnect", () => {
        console.info(`Socket ${socket.id} has disconnected.`);
    });

    require('./socket/events/game.event')(socket, downloads);
    require('./socket/events/music.event')(socket);
});

server.listen(8080, function() {
    console.log('listening on *:8080');
});
