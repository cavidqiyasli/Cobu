const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {};

io.on('connection', socket => {
  console.log('Yeni oyunçu qoşuldu:', socket.id);

  // Yeni oyunçu əlavə olunur
  socket.on('newPlayer', data => {
    players[socket.id] = { x: data.x, y: data.y };
    socket.broadcast.emit('playerJoined', { id: socket.id, x: data.x, y: data.y });
  });

  // Oyunçu hərəkət edir
  socket.on('move', data => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
    }
  });

  // Oyunçu çıxır
  socket.on('disconnect', () => {
    console.log('Oyunçu ayrıldı:', socket.id);
    delete players[socket.id];
    io.emit('playerLeft', socket.id);
  });
});

// 🔹 Bütün oyunçulara hər 50ms-də mövqeləri göndər
setInterval(() => {
  io.emit('positions', players);
}, 50);

server.listen(10000, () => console.log('Server işə düşdü, port: 10000'));
