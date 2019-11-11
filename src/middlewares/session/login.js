const { jwt: { decode } } = require('../../util');

module.exports = async (req) => {
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

  const user = await req.db.users.find(userId);
  if (user) {
    req.session.user = user;
    req.session.jwt = req.cookies.token || req.headers.authorization;
    req.session.isAdmin = req.config.admins.includes(user._id);
    return true;
  }
  return false;
};
