module.exports = {
  auth (req, res, next) {
    if (!req.session.jwt) {
      return res.status(401).send('You must be authenticated to see this. <a href=\'/\'>Home</a>');
    }
    next();
  },

  admin (req, res, next) {
    // Just checking isAdmin would be sufficient, but won't send the good status code
    if (!req.session.jwt) {
      return res.status(401);
    }
    if (!req.session.isAdmin) {
      return res.status(403);
    }
    next();
  }
};
