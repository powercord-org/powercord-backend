module.exports = (req, res) => {
  if (!req.session.jwt) {
    req.session._redirect = '/api/v1/users/link';
    return res.redirect('/oauth/discord');
  }

  res.render('linking', { jwt: req.session.jwt });
};
