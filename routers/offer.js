const express = require("express");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const tokens = require("../utils/tokens");
const cloudinary = require("../utils/configCloudinary");
const isAuthenticated = require("../middleware/isAuthenticated");
const ITEM_PER_PAGE = 20;

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
  try {
    const pic = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: "vinted/offers/",
      public_id: newOffer._id,
    });
    newOffer.product_image = { secure_url: pic.secure_url };
  } catch (error) {
    res.status(404).json({ message: error.message });
  }

  try {
    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

offerRoutes.get("/offers", async (req, res) => {
  try {
    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }

    const sorts = {};

    if (req.query.sort) {
      if (req.query.sort == "price-desc") {
        sorts.product_price = -1;
      } else if (req.query.sort == "price-asc") {
        sorts.product_price = 1;
      }
    }

    const pagination = { skip: 0, limit: ITEM_PER_PAGE };
    if (req.query.page) {
      pagination.skip = Number(req.query.page) * ITEM_PER_PAGE;
      pagination.limit = pagination.skip + ITEM_PER_PAGE;
    }
    const offers = await Offer.find(filters)
      .sort(sorts)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate({
        path: "owner",
        select: "account",
      });
    const count = await Offer.countDocuments(filters);
    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

offerRoutes.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = offerRoutes;
