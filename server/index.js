const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Router = require("../server/src/routes");
require("./src/db/connection");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/", Router);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Update with your client origin if needed
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // Format: { roomId: { players: [], chat: [], tossDone: false } }
const playerRoomMap = {}; // Format: { socketId: roomId }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", (callback) => {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    rooms[roomId] = { players: [socket.id], chat: [], tossDone: false };
    playerRoomMap[socket.id] = roomId;
    socket.join(roomId);
    callback(roomId);
  });

  socket.on("joinRoom", (roomId, callback) => {
    const room = rooms[roomId];
    if (room && room.players.length === 1) {
      room.players.push(socket.id);
      playerRoomMap[socket.id] = roomId;
      socket.join(roomId);
      // Track which room this socket is in
      socket.roomId = roomId;
      callback({ success: true });
      io.to(roomId).emit("playerJoined");
    } else {
      callback({ success: false, message: "Room full or not found" });
    }
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", message);
  });


  socket.on("toss", ({ roomId, selection }) => {
    console.log(roomId,selection,socket.id)
  });
  
  

  socket.on("makeMove", ({ roomId, board }) => {
    io.to(roomId).emit("updateBoard", board);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const roomId = playerRoomMap[socket.id];

    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      room.players = room.players.filter((id) => id !== socket.id);
      delete playerRoomMap[socket.id];

      if (room.players.length === 0) {
        delete rooms[roomId]; // Clean up empty room
      } else {
        const remainingPlayerId = room.players[0];
        io.to(remainingPlayerId).emit(
          "playerDisconnected",
          "The other player has disconnected."
        );
      }
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
