const express = require("express");
const router = express.Router();

// import de cloudinary
const cloudinary = require("cloudinary").v2;

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, phone, password } = req.fields;
    if (username && email && password) {
      const user = await User.findOne({ email: email });
      if (!user) {
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(64);

        const newUser = new User({
          email,
          account: {
            username,
            phone,
          },
          token,
          hash,
          salt,
        });

        if (req.files.picture) {
          const picture = req.files.picture.path;
          const resPicture = await cloudinary.uploader.upload(picture, {
            folder: `/vinted/users/${newUser._id}`,
            public_id: username,
          });
          newUser.account.avatar = resPicture;
        }

        await newUser.save();

        res.status(200).json({
          _id: newUser._id,
          token: token,
          account: newUser.account,
        });
      } else {
        res.status(409).json({ message: "cet email est déjà utilisé" });
      }
    } else {
      res
        .status(400)
        .json({ message: "veuillez renseigner le champ username" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email });
    if (user) {
      const hashTest = SHA256(password + user.salt).toString(encBase64);
      if (hashTest === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ message: "mot de passe incorrect" });
      }
    } else {
      res.status(400).json({ message: "ce compte n'existe pas" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
