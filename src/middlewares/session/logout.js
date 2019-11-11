module.exports = (req, res) => {
  res.cookie('token', '', { maxAge: -1 });
  delete req.session.jwt;
  delete req.session.discord;
  delete req.session.isAdmin;
};
