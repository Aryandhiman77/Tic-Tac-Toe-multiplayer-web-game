const jwt = require("jsonwebtoken");
const { io } = require("socket.io-client");
const jwtSecret = process.env.JWT_SECRET || "yourFallbackSecret";
const User = require('../db/modals/User.Model');
module.exports =async function (socket, next) {
  const token = socket.handshake.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.log("no token found.");
    return next(new Error("Authentication error."));
  }

  // verify the token, etc.
  try {
    const user = jwt.verify(token, jwtSecret);
    const userDetails = await User.findById(user?.id);
    console.log(userDetails);
    socket.username = userDetails?.username; // Attach user info if needed
    socket.email = userDetails?.email; // Attach user info if needed
    socket.userid = userDetails?.id; // Attach user info if needed
    socket.gameid = userDetails?.gameid; // Attach user info if needed
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    console.log(err.name);
    // return res.status(401).json({ message: "token expired", success: false });
    if (err.name === "TokenExpiredError") {
      return next(new Error(err.name));
    }
    return next(new Error("InvalidToken"));
  
    // return io.to(socket.id).emit("sktError", err.message);
  }
};
