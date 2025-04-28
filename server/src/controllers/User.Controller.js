const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult, body } = require("express-validator");
const User = require("../db/modals/User.Model"); // adjust based on your structure
const jwtSecret = process.env.JWT_SECRET || "yourFallbackSecret";
const mailSender = require('../utils/nodeMailer')
const userLogin = async (req, res) => {
  console.log("login request from user..");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    if(user.status === "active") return res.status(400).json({ message: "User had already login." });

    const isPassTrue = await bcrypt.compare(password, user.password);
    if (!isPassTrue)
      return res.status(401).json({ message: "Invalid credentials." });

    const payload = { id: user.id };

    const authToken = JWT.sign(payload, jwtSecret, { expiresIn: "2h" });
    const refreshToken = JWT.sign(payload, jwtSecret, { expiresIn: "48h" });

    user.refreshToken = refreshToken;
    // user.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        username: user.username,
        email: user.email,
        userid:user.gameid
      },
      authToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const userRegister = async (req, res) => {
  console.log("registration request came.");
  try {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, Email, and Password are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const enc_pass = await bcrypt.hash(password, salt);

    

    const saveUser = await User.create({
      username,
      email,
      password: enc_pass,
    });
    console.log(saveUser);
   

    if (saveUser) {
    const payload = { id: saveUser.id };
    const authtoken = JWT.sign(payload, jwtSecret, { expiresIn: "2h" });
    const refreshtoken = JWT.sign(payload, jwtSecret, { expiresIn: "48h" });
    saveUser.refreshToken = refreshtoken;
    saveUser.authToken = authtoken;

      return res.status(200).json({
        success: true,
        message: "Registration successful.",
        user: {
          username: saveUser.username,
          email: saveUser.email,
          userid:saveUser.gameid
        },
        authToken:authtoken,
        refreshToken:refreshtoken,
        
      });
    } else {
      return res
        .status(500)
        .json({ message: "Cannot save user due to technical issues." });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required." });

    // Remove refresh token from DB
    const user = await User.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: 1 } }
    );

    if (!user)
      return res.status(404).json({ message: "Invalid refresh token." });

    // set user status inactive after logout
    user.status = "inactive";
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const refreshTokens = async (req, res) => {
  console.log("providing tokens..");
    try {
      const token = req.body?.refreshToken;
      console.log('got token : ',token);
      if (!token) {
        return res.status(400).json({ message: "Refresh token is required." });
      }
  
      JWT.verify(token, jwtSecret, async (error, decoded) => {
        if (error) {
          return res.status(401).json({
            success: false,
            message: error.name,
          });
        }
  
        const user = await User.findById(decoded.id); // finding user by id  in db
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
  
        // Compare with db refresh token
        if (user.refreshToken !== token) {
          return res.status(403).json({
            success: false,
            message: "Refresh token mismatch.",
          });
        }
  
        const payload = { id: user.id }; 
        const newAccessToken = JWT.sign(payload, jwtSecret, {
          expiresIn: "2h",
        });
        const newrefreshToken = JWT.sign(payload, jwtSecret, {
          expiresIn: "48h",
        });
  
        // Update new refresh token in DB
        user.refreshToken = newrefreshToken;
        const savedToken = await user.save();
        console.log('saved token in db');
  
        return res.status(200).json({
          success: true,
          message: "Token refreshed successfully.",
          authToken: newAccessToken,
          refreshToken: newrefreshToken,
        });
      });
    } catch (error) {
      console.error("Token Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  const forgotPass = (req,res)=>{
      try {
        const {email} = req.body;
        if (!email) {(400).json({
            success: false,
            message: "Email address required.",
          });
        }
          const mailobj= {
          from:"TicTacToe <aryandhiman015@gmail.com>",
          to:email,
          subject:"Tic Tac Toe password reset",
          html:`
          <h1 style="text-align:center">Your Tic Tac Toe multiplayer password reset is:</h1><br>
          <p style="text-align:center"></p>
          `
        }
        mailSender({...mailobj});
        console.log('mail sent successfully.')
        

      } catch (error) {
        console.error("Forgot password Error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
      }
  } 

module.exports = { userLogin, userRegister, refreshTokens, logoutUser ,forgotPass};
