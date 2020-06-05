// Package imports
const mongoose = require('mongoose');
const fs = require("fs");
const express = require('express');
const socketIO = require("socket.io");
const https = require("https"); // HTTPS
// const http = require("http"); // HTTP

// Handlers
const { postRoomHandler, getRoomHandler, getRoomIdHandler, deleteRoomIdHandler } = require('./handlers/room');
const { postMatchHandler, getMatchHandler, deleteMatchHandler } = require('./handlers/match');
const { postLikeHandler, getLikeHandler, deleteLikeHandler } = require('./handlers/likes');
const { getUpcomingHandler } = require('./handlers/upcoming');

// Schemas and Models
const { matchSchema, roomSchema } = require('./schemas');
const Match = mongoose.model("Match", matchSchema);
const Room = mongoose.model("Room", roomSchema);


const options = { // HTTPS
    key: fs.readFileSync(process.env.TLSKEY),
    cert: fs.readFileSync(process.env.TLSCERT)
};

const port = 443; // HTTPS
// const port = 80; // HTTP
// const mongoEndpoint = "mongodb://localhost:27017/test"; // LOCAL TESTING
const mongoEndpoint = "mongodb://mongodemo:27017/test"; // DEPLOY
// console.log(options);

// Set up Express
const app = express();
const httpServer = https.createServer(options, app); // HTTPS
// const httpServer = http.createServer(app); // HTTP
const io = socketIO(httpServer);

// Socket Variables
let activeSockets = [];

app.use(express.json()); // Parse json only
const connect = () => {
    mongoose.connect(mongoEndpoint);
}
connect();

mongoose.connection.on('error', console.error) // log error if connection fails
    .on('disconnected', connect) // attempt to connect when disconnected
    .once('open', main); // run async function to connect to mysql when the connection is open


const RequestWrapper = (handler, SchemaAndDbForwarder) => {
    return (req, res) => {
        handler(req, res, SchemaAndDbForwarder);
    }
}

async function main() {
    app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, X-User, x-user');
        next();
    });

    // Endpoints
    app.get("/room/:roomid", RequestWrapper(getRoomIdHandler, { Room }));
    app.delete("/v1/room/:roomid", RequestWrapper(deleteRoomIdHandler, { Room }));

    app.get("/v1/room", RequestWrapper(getRoomHandler, { Room }));
    app.post("/v1/room", RequestWrapper(postRoomHandler, { Room }));

    app.get("/v1/matches", RequestWrapper(getMatchHandler, { Match }));
    app.post("/v1/matches", RequestWrapper(postMatchHandler, { Match }));
    app.delete("/v1/matches", RequestWrapper(deleteMatchHandler, { Match }));

    app.get("/v1/likes", RequestWrapper(getLikeHandler, { Match }));
    app.post("/v1/likes", RequestWrapper(postLikeHandler, { Match }));
    app.delete("/v1/likes", RequestWrapper(deleteLikeHandler, { Match }));

    app.get("/v1/upcoming", RequestWrapper(getUpcomingHandler, { Room }));

    httpServer.listen(port, "", () => {
        console.log(`server listening at port ${port}`);
    });

    // Socket Connection Handling
    io.on("connection", socket => {
        // console.log("Socket connected!");

        // Check if the Socket already exists
        const existingSocket = activeSockets.find(
            existingSocket => existingSocket === socket.id
        );

        if (!existingSocket) {
            activeSockets.push(socket.id);
            socket.emit("get-user-id", { user: socket.id });

            io.emit("update-user-list", {
                users: activeSockets
            });

            // console.log("Connected to a new socket: " + socket.id);
            // console.log();
        }

        // Calling Socket
        socket.on("call-user", data => {
            console.log("call-user");
            console.log(socket.id + " is calling " + data.to);
            socket.to(data.to).emit("call-made", {
                offer: data.offer,
                socket: socket.id
            });
        });

        socket.on("make-answer", data => {
            console.log("make-answer");
            console.log(socket.id + " answering " + data.to + "'s call");
            socket.to(data.to).emit("answer-made", {
                socket: socket.id,
                answer: data.answer
            });
        });

        socket.on("ice-candidate", data => {
            console.log("ice-candidate");
            console.log("Ice candidate sending");
            socket.to(data.to).emit("ice-candidate-made", {
                type: "candidate",
                candidate: data.candidate
            });
        });


        // Disconnecting Sockets
        socket.on("disconnect", () => {
            activeSockets = activeSockets.filter(
                existingSocket => existingSocket !== socket.id
            );

            io.emit("update-user-list", { users: activeSockets });
            io.emit("disconnect-call", { user: socket.id });
        });
    });


}

