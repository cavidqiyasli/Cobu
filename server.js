const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let players = {};

io.on('connection', socket => {
  console.log('Yeni oyunçu qoşuldu:', socket.id);

  // 🔹 Yeni oyunçu əlavə olunur
  socket.on('newPlayer', data => {
    players[socket.id] = { x: data.x, y: data.y };
    socket.broadcast.emit('playerJoined', { id: socket.id, x: data.x, y: data.y });
  });

  // 🔹 Oyunçu hərəkət edir
  socket.on('move', data => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
    }
  });

  // 🔹 Oyunçu atəş açır
  socket.on('shoot', data => {
    // Bütün oyunçulara bu atış hadisəsini göndər
    io.emit('playerShoot', {
      id: socket.id,
      x: data.x,
      y: data.y,
      angle: data.angle
    });
  });

  // 🔹 Oyunçu ayrılır
  socket.on('disconnect', () => {
    console.log('Oyunçu ayrıldı:', socket.id);
    delete players[socket.id];
    io.emit('playerLeft', socket.id);
  });
});

// 🔹 Hər 50ms-də bütün oyunçuların mövqeyini göndər
setInterval(() => {
  io.emit('positions', players);
}, 50);

// 🔹 Serveri işə sal
server.listen(10000, () => console.log('Server işə düşdü, port: 10000'));

// Her 5 saniyede bir oyunculardan "ping" al
io.on('connection', socket => {
  socket.on('pingCheck', () => {
    socket.emit('pongCheck');
  });
});


