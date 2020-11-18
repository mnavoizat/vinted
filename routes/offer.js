const express = require("express");
const router = express.Router();

// import de cloudinary
const cloudinary = require("cloudinary").v2;

// import des models
const User = require("../models/User");
const Offer = require("../models/Offer");

// import des middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ETAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    // if (req.files.picture) {
    //   const picture = req.files.picture.path;
    //   const resPicture = await cloudinary.uploader.upload(picture, {
    //     folder: `/vinted/offers/${newOffer._id}`,
    //     public_id: title,
    //   });
    //   newOffer.product_image = resPicture;
    // }
    console.log(req.files.picture);

    if (req.files.picture) {
      const picture = req.files.picture;
      console.log(picture);

      if (Array.isArray(picture)) {
        listPicture = [];
        for (let i = 0; i < picture.length; i++) {
          const resPicture = await cloudinary.uploader.upload(picture[i].path, {
            folder: `/vinted/offers/${newOffer._id}`,
            public_id: `${title}_${i}`,
          });
          listPicture.push(resPicture);
        }
        newOffer.product_image = listPicture[0];
        newOffer.product_pictures = listPicture;
      } else {
        const resPicture = await cloudinary.uploader.upload(picture.path, {
          folder: `/vinted/offers/${newOffer._id}`,
          public_id: title,
        });
        newOffer.product_image = resPicture;
      }
    }

    // const fileKeys = Object.keys(req.files);
    // let results = {};
    // if (fileKeys.length === 0) {
    //   res.send("No file uploaded!");
    // } else {
    //   fileKeys.forEach(async (fileKey) => {
    //     const file = req.files[fileKey];
    //     const result = await cloudinary.uploader.upload(file.path);
    //     results[fileKey] = {
    //       success: true,
    //       result: result,
    //     };
    //   });
    // }
    // if (Object.keys(results).length === fileKeys.length) {
    //   // tous les uploads sont terminés, on peut donc envoyer la réponse au client
    // }

    await newOffer.save();

    res.status(200).json({
      _id: newOffer._id,
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_price: newOffer.product_price,
      product_details: newOffer.product_details,
      product_image: newOffer.product_image,
      product_pictures: newOffer.product_pictures,
      owner: { account: newOffer.owner.account, _id: newOffer.owner._id },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/offer/update", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findById(req.fields.id).populate("owner");
    if (offer) {
      const {
        title,
        description,
        price,
        condition,
        city,
        brand,
        size,
        color,
      } = req.fields;

      if (title) {
        offer.product_name = title;
      }
      if (description) {
        offer.product_description = description;
      }
      if (price) {
        offer.product_price = price;
      }
      if (brand) {
        offer.product_details[0] = { MARQUE: brand };
      }
      if (size) {
        offer.product_details[1] = { TAILLE: size };
      }
      if (condition) {
        offer.product_details[2] = { ETAT: condition };
      }
      if (color) {
        offer.product_details[3] = { COULEUR: color };
      }
      if (city) {
        offer.product_details[4] = { EMPLACEMENT: city };
      }

      if (req.files.picture) {
        const picture = req.files.picture.path;
        const resPicture = await cloudinary.uploader.upload(picture, {
          folder: `/vinted/offers/${offer._id}`,
          public_id: title,
        });
        offer.product_image = resPicture;
      }

      await offer.save();

      res.status(200).json({
        product_name: offer.product_name,
        product_description: offer.product_description,
        product_price: offer.product_price,
        product_details: offer.product_details,
        product_image: offer.product_image,
        owner: { account: offer.owner.account, _id: offer.owner._id },
      });
    } else {
      res.status(401).json({ message: "Cette offre n'existe pas" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findById(req.fields.id);
    await cloudinary.api.delete_resources(offer.product_image.public_id);
    await cloudinary.api.delete_folder(`vinted/offers/${offer._id}`);
    await offer.deleteOne();

    res.status(200).json({ message: "Offre supprimée" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let { title, priceMin, priceMax, sort, page, limit } = req.query;
    let filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: priceMin };
    }
    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = { $lte: priceMax };
      }
    }

    let sorting = {};
    if (sort === "price-asc") {
      sorting.product_price = "asc";
    } else if (sort === "price-desc") {
      sorting.product_price = "desc";
    }

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }
    const offers = await Offer.find(filters)
      .sort(sorting)
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .populate({ path: "owner", select: "account" });
    //.select("_id product_price");

    const count = await Offer.countDocuments(filters);

    res.status(200).json({
      count,
      offers,
    });
  } catch (error) {
    res.status(400).json({ error: error.response });
  }
});

router.get("/offer/:id", async (req, res) => {
  // bien mettre cette route qui prend des params après la route offer/publish
  // sinon les requêtes vers publish passerait dans cette route
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account _id",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
