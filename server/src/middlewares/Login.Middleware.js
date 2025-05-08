const jwt = require("jsonwebtoken");
const User = require("../db/modals/User.Model");
const jwtSecret = process.env.JWT_SECRET || "yourFallbackSecret";

module.exports = async function LoginMiddleware(req, res, next) {

  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if(decoded){
      req.user = decoded;

      const userinfo = await User.findById(decoded.id);
      console.log(userinfo);
      req.mygameid = userinfo.gameid;
    }

    next();
  } catch (error) {
    console.log(error.name);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({success:false,message:error.name});
    }
   
  }
};
