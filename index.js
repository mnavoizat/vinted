const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

// initialisation du serveur
const app = express();
app.use(formidable({ multiples: true }));
app.use(cors());
//{ multiples: true }
// initialisation de la BDD
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// import et configuration de cloudinary
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// import des routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
const payRoutes = require("./routes/pay");
app.use(payRoutes);

// all routes
app.all("*", (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
