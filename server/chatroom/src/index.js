const fs = require("fs");
const express = require('express');
const path = require('path');
const socketIO = require("socket.io");
const https = require("https");
const options = {
    key: fs.readFileSync(process.env.TLSKEY),
    cert: fs.readFileSync(process.env.TLSCERT)
};

const port = 443;
// console.log(options);

// Set up Express
const app = express();
const httpServer = https.createServer(options, app);
const io = socketIO(httpServer);

// Socket Variables
let activeSockets = [];

app.use(express.json()); // Parse json only

// Our endpoints


// Serve /public folder
app.use(express.static(path.join(__dirname, "../public")));

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

        // console.log(`Socket ${socket.id} Disconnected!`);
        // console.log("Currently Active sockets: " + activeSockets);
        // console.log();
    });
});

