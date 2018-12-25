const getDB = require('../db');
const config = require('../../config.json');

module.exports = {
  async auth (req, res, next) {
    if (!req.session.discord) {
      return res.status(401).send("You must be authenticated to see this. <a href='/'>Home</a>");
    }
    next();
  },

  async admin (req, res, next) {
    // Just checking isAdmin would be sufficient, but won't send the good status code
    if (!req.session.discord) {
      return res.status(401).send("You must be authenticated to see this. <a href='/'>Home</a>");
    }
    if (!req.session.isAdmin) {
      return res.status(403).send("You're not allowed to see this. <a href='/'>Home</a>");
    }
    next();
  }
};
