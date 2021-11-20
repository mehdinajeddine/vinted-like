const express = require("express");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const tokens = require("../utils/tokens");
const cloudinary = require("../utils/configCloudinary");
const isAuthenticated = require("../middleware/isAuthenticated");

const Offer = require("../models/Offer");

const offerRoutes = express.Router();

offerRoutes.post("/offer/publish", isAuthenticated, async (req, res) => {
  let price = req.fields.price > 10000 ? 10000 : req.fields.price;
  const newOffer = new Offer({
    product_name: req.fields.title.slice(0, 50),
    product_description: req.fields.description.slice(0, 500),
    product_price: price,
    product_details: [
      { ÉTAT: req.fields.condition },
      { EMPLACEMENT: req.fields.city },
      { MARQUE: req.fields.brand },
      { TAILLE: req.fields.size },
      { COULEUR: req.fields.color },
    ],
    owner: req.user,
  });
  await newOffer.save();
  const pic = await cloudinary.uploader.upload(req.files.picture.path, {
    folder: "vinted/offers/",
    public_id: newOffer._id,
  });
  newOffer.product_image = { secure_url: pic.secure_url };
  await newOffer.save();
  res.status(200).json(newOffer);
});

module.exports = offerRoutes;
