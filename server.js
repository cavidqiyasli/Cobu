const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let users = {}; // {socketId: {name, email, photo}}

io.on("connection", socket => {
  console.log("Yeni istifadəçi qoşuldu:", socket.id);

  socket.on("registerUser", data => {
    users[socket.id] = data;
    io.emit("userList", users);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
  });

  // Global mesaj
  socket.on("globalMessage", data => {
    io.emit("globalMessage", {
      name: users[socket.id]?.name,
      photo: users[socket.id]?.photo,
      text: data.text,
      ts: Date.now()
    });
  });

  // Şəxsi mesaj
  socket.on("privateMessage", data => {
    const targetId = data.to;
    if (users[targetId]) {
      io.to(targetId).emit("privateMessage", {
        from: socket.id,
        name: users[socket.id]?.name,
        photo: users[socket.id]?.photo,
        text: data.text,
        ts: Date.now()
      });
    }
  });
});

server.listen(10000, () => console.log("✅ Server işə düşdü, port: 10000"));
