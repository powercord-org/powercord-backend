module.exports = {
  v1: {
    link: (req, res) => {
      if (!req.session.discord) {
        req.session._redirect = '/api/v1/users/link';
        return res.redirect('/oauth/discord');
      }
      res.render('linking', {
        jwt: req.session.jwt
      });
    },
    getMe: (req, res) => {
      res.json({
        id: req.session.tokens.id,
        spotify: req.session.spotify
          ? {
            name: req.session.spotify.display_name,
            token: req.session.tokens.spotify.access_token
          }
          : null,
        github: req.session.github ? { name: req.session.github.name } : null
      });
    }
  }
};
