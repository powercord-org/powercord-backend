class Linking {
  registerRoutes (express) {
    express.get('/api/v2/users/@me/link', this.linkAccount);
  }

  linkAccount (req, res) {
    if (!req.session.jwt) {
      req.session._redirect = '/api/v2/users/@me/link';
      return res.redirect('/oauth/discord');
    }

    res.render('linking', { jwt: req.session.jwt });
  }
}

module.exports = Linking;
