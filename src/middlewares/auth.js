module.exports = (admin) => (req, res, next) => {
  if (!req.session.jwt) {
    return res.status(401);
  }
  if (admin && !req.session.isAdmin) {
    return res.status(403);
  }
  next();
};
