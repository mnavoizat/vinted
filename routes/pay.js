const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/pay", async (req, res) => {
  // Réception du token créer via l'API Stripe depuis le Frontend
  const { stripeToken, amount, title } = req.fields;
  // Créer la transaction
  const response = await stripe.charges.create({
    amount: amount,
    currency: "eur",
    description: title,
    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);
  // TODO
  // Sauvegarder la transaction dans une BDD MongoDB
  res.json(response);
});
module.exports = router;
