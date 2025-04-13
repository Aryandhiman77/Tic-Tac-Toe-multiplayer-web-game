const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', (callback) => {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    rooms[roomId] = { players: [socket.id], chat: [], tossDone: false };
    socket.join(roomId);
    callback(roomId);
  });

  socket.on('joinRoom', (roomId, callback) => {
    const room = rooms[roomId];
    if (room && room.players.length === 1) {
      room.players.push(socket.id);
      socket.join(roomId);
      callback({ success: true });
      io.to(roomId).emit('playerJoined');
    } else {
      callback({ success: false, message: 'Room full or not found' });
    }
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    io.to(roomId).emit('receiveMessage', message);
  });

  socket.on('toss', ({ roomId }) => {
    const result = Math.random() < 0.5 ? 'Player1' : 'Player2';
    io.to(roomId).emit('tossResult', result);
  });

  socket.on('makeMove', ({ roomId, board }) => {
    io.to(roomId).emit('updateBoard', board);
    console.log(board);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // TODO: handle room clean-up
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
