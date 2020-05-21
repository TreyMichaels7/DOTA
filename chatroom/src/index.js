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
// app.get("/", (req, res) => {
//     res.send(`<h1>Hello World</h1>`);
// });

app.use(express.static(path.join(__dirname, "../public")));


httpServer.listen(port, "", () => {
    console.log(`server listening at port ${port}`);
});

io.on("connection", socket => {
    console.log("Socket connected!")
});