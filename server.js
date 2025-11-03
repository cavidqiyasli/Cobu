const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = {}; // { socket.id: { name, email, photo } }

io.on("connection", socket => {
  console.log("Yeni istifadəçi qoşuldu:", socket.id);

  // 🔹 İstifadəçi qeydiyyatdan keçir
  socket.on("registerUser", user => {
    users[socket.id] = user;
    console.log(`${user.name} daxil oldu`);
    io.emit("userList", users); // hamıya siyahı göndər
  });

  // 🔹 Global chat mesajı
  socket.on("globalMessage", msg => {
    const sender = users[socket.id];
    if (sender) {
      io.emit("globalMessage", {
        name: sender.name,
        text: msg.text
      });
    }
  });

  // 🔹 Şəxsi mesaj
  socket.on("privateMessage", data => {
    const sender = users[socket.id];
    if (sender && users[data.to]) {
      io.to(data.to).emit("privateMessage", {
        name: sender.name,
        text: data.text
      });
    }
  });

  // 🔹 İstifadəçi çıxır
  socket.on("disconnect", () => {
    console.log("İstifadəçi ayrıldı:", socket.id);
    delete users[socket.id];
    io.emit("userList", users);
  });
});

// 🔹 Render üçün düzgün port
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`✅ Server işə düşdü, port: ${PORT}`));
