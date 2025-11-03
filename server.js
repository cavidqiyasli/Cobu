const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', socket => {
  console.log('Yeni istifadəçi qoşuldu:', socket.id);

  // Mesaj al
  socket.on('chatMessage', msg => {
    console.log('Mesaj:', msg);
    // Bütün istifadəçilərə göndər
    io.emit('chatMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('İstifadəçi ayrıldı:', socket.id);
  });
});

server.listen(10000, () => console.log('Chat server işə düşdü, port: 10000'));
