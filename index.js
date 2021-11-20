const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/vinted");

const app = express();
app.use(formidable());

const userRoutes = require("./routers/user");
const offerRoutes = require("./routers/offer");
app.use(userRoutes);
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(3000, () => {
  console.log("server started");
});
