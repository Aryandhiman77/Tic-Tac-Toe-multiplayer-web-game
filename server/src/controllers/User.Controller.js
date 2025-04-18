const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult, body } = require("express-validator");
const User = require("../db/modals/User.Model"); // adjust based on your structure
const jwtSecret = process.env.JWT_SECRET || "yourFallbackSecret";

const userLogin = async (req, res) => {
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

    const isPassTrue = await bcrypt.compare(password, user.password);
    if (!isPassTrue)
      return res.status(401).json({ message: "Invalid credentials." });

    const payload = { id: user.id };

    const authtoken = JWT.sign(payload, jwtSecret, { expiresIn: "2h" });
    const refreshtoken = JWT.sign(payload, jwtSecret, { expiresIn: "48h" });

    user.refreshToken = refreshtoken;
    user.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        username: user.username,
        email: user.email,
      },
      authtoken,
      refreshtoken,
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

    const payload = {
      username,
      email,
    };

    const authtoken = JWT.sign(payload, jwtSecret, { expiresIn: "2h" });
    const refreshToken = JWT.sign(payload, jwtSecret, { expiresIn: "48h" });

    const saveUser = await User.create({
      username,
      email,
      password: enc_pass,
      refreshToken,
      status: "active",
    });

    if (saveUser) {
      return res.status(200).json({
        success: true,
        message: "Registration successful.",
        user: {
          username: saveUser.username,
          email: saveUser.email,
        },
        authtoken,
        refreshToken,
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
const refreshToken = async (req, res) => {
    try {
      const token = req.body.refreshToken;
      if (!token) {
        return res.status(400).json({ message: "Refresh token is required." });
      }
  
      JWT.verify(token, jwtSecret, async (error, decoded) => {
        if (error) {
          return res.status(401).json({
            success: false,
            message: "Invalid refresh token.",
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
        const newRefreshToken = JWT.sign(payload, jwtSecret, {
          expiresIn: "48h",
        });
  
        // Update new refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save();
  
        return res.status(200).json({
          success: true,
          message: "Token refreshed successfully.",
          authtoken: newAccessToken,
          refreshToken: newRefreshToken,
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
  
module.exports = { userLogin, userRegister, refreshToken, logoutUser };
