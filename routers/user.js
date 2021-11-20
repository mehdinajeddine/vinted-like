const express = require("express");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const tokens = require("../utils/tokens");
const isAuthenticated = require("../middleware/isAuthenticated");
const cloudinary = require("../utils/configCloudinary");

const userRoutes = express.Router();

const User = require("../models/User");

const checkEmailFormat = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

userRoutes.post("/user/signup", async (req, res) => {
  const email = req.fields.email;
  const password = req.fields.password;
  const salt = tokens.generateSalt();
  const hash = tokens.generateHash(password + salt);
  const token = tokens.generateToken();
  try {
    const pic = await cloudinary.uploader.upload(req.files.avatar.path, {
      folder: "vinted/user/",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de chargement de l'avatar." });
  }

  if (!checkEmailFormat(email)) {
    res.status(403).json(`Email format is not good`);
    return;
  }

  const newUser = new User({
    email: email,
    account: {
      username: req.fields.username,
      phone: req.fields.phone,
      avatar: pic.secure_url,
    },
    token: token,
    hash: hash,
    salt: salt,
  });
  try {
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

userRoutes.post("/user/login", async (req, res) => {
  const email = req.fields.email;
  if (!checkEmailFormat(email)) {
    res.status(403).json(`Email format is not good`);
    return;
  }
  const password = req.fields.password;
  try {
    const currentUser = await User.findOne({
      email: email,
    });

    if (currentUser) {
      const hash = tokens.generateHash(password + currentUser.salt);
      const token = tokens.generateToken();
      if (hash == currentUser.hash) {
        currentUser.token = token;
        await currentUser.save();
        res.status(200).json(currentUser);
      } else {
        res.status(403).json(`Email or Password not good`);
      }
    } else {
      res.status(403).json(`No User exists with ${email}`);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = userRoutes;
