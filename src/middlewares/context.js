const getDB = require('../db');
const config = require('../../config.json');

module.exports = async (boat) => {
  const db = await getDB();
  return (req, res, next) => {
    req.config = config;
    req.boat = boat;
    req.db = db;
    next();
  };
};
