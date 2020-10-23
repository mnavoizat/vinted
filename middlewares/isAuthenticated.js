const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ token });
      if (user) {
        req.user = user;
        return next();
      } else {
        return res.status(401).json({ error: "Accès refusé" });
      }
    } else {
      return res.status(401).json({ error: "Accès refusé" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
