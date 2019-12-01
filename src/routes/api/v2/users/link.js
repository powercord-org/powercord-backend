class Linking {
  registerRoutes (express) {
    express.get('/api/v2/users/@me/link/legacy', this.linkAccountLegacy.bind(this));
  }

  linkAccountLegacy (req, res) {
    if (!req.session.jwt) {
      req.session._redirect = '/api/v2/users/@me/link/legacy';
      return res.redirect('/oauth/discord');
    }

    res.render('linkingLegacy', { jwt: req.session.jwt });
  }
}

module.exports = Linking;
