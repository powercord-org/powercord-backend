const config = require('../../config.json');

module.exports = async (db, boat, redis) => (req, res, next) => {
  req.config = config;
  req.redis = redis;
  req.boat = boat;
  req.db = db;
  next();
};
