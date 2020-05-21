const express = require('express');
const path = require('path');
const http = require("http");
const socketIO = require("socket.io");
const port = 80;

// Set up Express
const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer);

// Other variables
let activeSockets = [];

app.use(express.json()); // Parse json only

// Our endpoints

// Serve /public folder
app.use(express.static(path.join(__dirname, "../public")));

httpServer.listen(port, "", () => {
    console.log(`server listening at port ${port}`);
});

io.on("connection", socket => {
    console.log("Socket connected!");
    const existingSocket = activeSockets.find(
        existingSocket => existingSocket === socket.id
    );

    if (!existingSocket) {
        activeSockets.push(socket.id);

        socket.emit("update-user-list", {
            users: activeSockets.filter(
                existingSocket => existingSocket !== socket.id
            )
        });

        socket.broadcast.emit("update-user-list", {
            users: [socket.id]
        });
        console.log("Connected to a new socket: " + socket.id);
        console.log("Currently Active sockets: " + activeSockets);
    } else {
        console.log("Reconnected to previous socket: " + existingSocket);
    }

    socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} Disconnected!`);
        activeSockets = activeSockets.filter(
            existingSocket => existingSocket !== socket.id
        );

        socket.broadcast.emit("remove-user", {
            socketId: socket.id
        });
    });
});

