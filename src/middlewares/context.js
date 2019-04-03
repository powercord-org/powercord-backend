const config = require('../../config.json');

module.exports = async (db, boat) => (req, res, next) => {
  req.config = config;
  req.boat = boat;
  req.db = db;
  next();
};
