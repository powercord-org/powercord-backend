const getDB = require('../db');
const config = require('../../config.json');

module.exports = async () => {
  const db = await getDB();
  return (req, res, next) => {
    req.config = config;
    req.db = db;
    next();
  };
};
