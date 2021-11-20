const moongoose = require("mongoose");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  const existingUser = await User.findOne({ token: token });
  if (!existingUser) {
    res.status(401).json({ message: "User not Found" });
  } else {
    req.user = existingUser;
    next();
  }
};

module.exports = isAuthenticated;
