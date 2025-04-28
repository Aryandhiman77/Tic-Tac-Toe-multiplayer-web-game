const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Router = require("../server/src/routes");
const SocketMiddleware = require("./src/middlewares/Socket.Middleware");
const User = require('./src/db/modals/User.Model');
const Friend = require("./src/db/modals/Friend.Model");
require("./src/db/connection");
// let loginMiddleware = require('../server/src/middlewares/Login.Middleware')
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
io.use(SocketMiddleware);

const rooms = {}; // Format: { roomId: { players: [], chat: [], tossDone: false } }
const playerRoomMap = {}; // Format: { socketId: roomId }


io.on("connection", (socket) => {
  console.log(socket.username," connected with socket id :", socket.id);
  socket.broadcast.emit("checkOnlineUser",{userid:socket.gameid});
  console.log(socket.id);
  
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
  let Roomhost;
  let JoinedNode;
  socket.on("toss", ({ roomId, selection }) => {
    Roomhost = {id:rooms[roomId]?.players[0]}; //Player1
    JoinedNode = {id:rooms[roomId]?.players[1]}; //Player2
    
    if(JoinedNode.id ===socket.id){
      io.to(Roomhost.id).emit("opponent", {username:socket.username,selection});
    }
    if(Roomhost.id ===socket.id){
      io.to(JoinedNode.id).emit("opponent",{username:socket.username,selection});
    }
  });
  socket.on("tossResult", ({ roomId, winner }) => {
    console.log(winner);
    io.to(roomId).emit("tossWinner",winner)
  });

  socket.on("makeMove", ({ roomId, board }) => {
    io.to(roomId).emit("updateBoard", board);
  });

  socket.on('updateStatus',async()=>{
    console.log("updating status.");
    const user = await User.findById(socket.userid);
    console.log(user);
    user.status = "active";
    user.save();
    io.to(socket.id).emit("updatedStatus","online");
  })


  socket.on("disconnect", async() => {
    socket.broadcast.emit("checkOfflineUser",{userid:socket.gameid});
    console.log("User disconnected:", socket.id);
    const user = await User.findById(socket.userid);
    user.status = "inactive";
    user.save();
    io.to(socket.id).emit("updatedStatus","offline");
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
