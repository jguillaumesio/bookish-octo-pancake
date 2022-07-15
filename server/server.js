require('dotenv').config();
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

let token = null;

app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

require("./api/routes/game.route")(app, token);
require("./api/routes/installation.route")(app, token);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
    next();
});

let downloads = {};
io.on("connection", (socket) => {
    console.info(`Socket ${socket.id} has connected.`);

    socket.on("disconnect", () => {
        console.info(`Socket ${socket.id} has disconnected.`);
    });

    require('./socket/events/game.event')(socket, downloads);
});

server.listen(8080, function() {
    console.log('listening on *:8080');
});
