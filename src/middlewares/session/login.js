/* eslint-disable */
const { jwt: { decode } } = require('../../util');

module.exports = async (req, res) => {
  if (!req.cookies.token && !req.headers.authorization) {
    return null;
  }

  const token = req.cookies.token || req.headers.authorization;
  let userId;
  try {
    userId = await decode(token);
  } catch (err) {
    switch (err.message) {
      case 'invalid signature':
      case 'invalid algorithm':
      case 'jwt malformed':
        return null;
      default:
        // noinspection ExceptionCaughtLocallyJS
        throw err;
    }
  }

  return req.db.users.findOne({ id: userId });
};
