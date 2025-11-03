const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", socket => {
  console.log("Yeni oyunçu qoşuldu:", socket.id);
  players[socket.id] = { x: 400, y: 300 };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", { id: socket.id, x: 400, y: 300 });

  socket.on("move", data => {
    players[socket.id] = data;
    socket.broadcast.emit("playerMoved", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("Oyunçu çıxdı:", socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

http.listen(10000, () => console.log("Server işə düşdü 10000 portunda"));
