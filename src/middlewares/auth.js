module.exports = (admin) => (req, res, next) => {
  if (!req.session.jwt) {
    return res.sendStatus(401);
  }
  if (admin && !req.session.isAdmin) {
    return res.sendStatus(403);
  }
  next();
};
