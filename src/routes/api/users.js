module.exports = {
  v1: {
    getMe: (req, res) => {
      res.json({
        id: req.session.user.id,
        spotify: req.session.spotify
          ? {
            name: req.session.spotify.display_name,
            token: req.session.user.spotify.access_token
          }
          : null,
        github: req.session.github ? { name: req.session.github.name } : null
      });
    },

    getSettings: (req, res) => {
      res.json(req.user.settings || {
        isEncrypted: false,
        payload: '{}'
      });
    },

    saveSettings: (req, res) => {
      if (typeof req.body.isEncrypted === 'undefined' || typeof req.body.payload === 'undefined') {
        res.sendStatus(400);
      }

      req.db.users.updateOne({ id: req.session.user.id }, {
        $set: {
          settings: {
            timestamp: Date.now(),
            isEncrypted: req.body.isEncrypted,
            payload: req.body.payload
          }
        }
      });
      res.sendStatus(204);
    },

    link: (req, res) => {
      if (!req.session.jwt) {
        req.session._redirect = '/api/v1/users/link';
        return res.redirect('/oauth/discord');
      }

      res.render('linking', {
        jwt: req.session.jwt
      });
    },

    getSomeone: async (req, res) => {
      const user = await req.db.users.findOne({
        id: req.params.id
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          error: 'Not found'
        });
      }

      // I use !! just to make sure value is present in payload, even if we define it by default. Never too safe #RS256
      res.json({
        developer: !!user.metadata.developer,
        contributor: !!user.metadata.contributor,
        tester: !!user.metadata.tester,
        hunter: !!user.metadata.hunter
      });
    }
  }
};
