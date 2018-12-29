module.exports = {
  v1: {
    whoAmI: (req, res) => {
      res.send(req.session.jwt);
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
