const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "yourFallbackSecret";

module.exports = function LoginMiddleware(req, res, next) {

  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    // console.log(error.name);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({success:false,message:error.name});
    }
   
  }
};
