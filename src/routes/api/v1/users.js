const SpotifyOAuth = require('../../../util/oauth/spotify');

module.exports = {
  getMe: (req, res) => {
    res.json({
      id: req.session.user.id,
      spotify: (req.session.user.spotify && req.session.user.spotify.name) ? req.session.user.spotify.name : null,
      github: (req.session.user.github && req.session.user.github.name) ? req.session.user.github.name : null,
      gitlab: (req.session.user.gitlab && req.session.user.gitlab.name) ? req.session.user.gitlab.name : null
    });
  },

  getSpotify: async (req, res) => {
    if (!req.session.user.spotify) {
      return res.json({ token: null });
    }

    if (!req.session.user.spotify.scopes || !req.config.spotify.scopes.every(key => req.session.user.spotify.scopes.includes(key))) {
      await req.db.users.updateOne({ id: req.session.user.id }, { $set: { spotify: null } });

      return res.json({
        token: null,
        revoked: 'SCOPES_UPDATED'
      });
    }

    if (Date.now() >= req.session.user.spotify.expiryDate) {
      let token;
      try {
        token = await SpotifyOAuth.refreshToken(req.session.user.spotify.refresh_token);
      } catch (e) {
        if (e.statusCode < 500) {
          await req.db.users.updateOne({ id: req.session.user.id }, { $set: { spotify: null } });
          return res.json({
            token: null,
            revoked: 'ACCESS_DENIED'
          });
        }
        console.log(e);
        return res.json({ token: null });
      }
      req.session.user.spotify.access_token = token.access_token;
      await req.db.users.updateOne({ id: req.session.user.id }, {
        $set: {
          'spotify.access_token': token.access_token,
          'spotify.expiryDate': Date.now() + (token.expires_in * 1000)
        }
      });
    }

    return res.json({ token: req.session.user.spotify.access_token });
  },

  getSettings: (req, res) => {
    res.json(req.session.user.settings || {
      isEncrypted: false,
      powercord: null,
      discord: null
    });
  },

  saveSettings: (req, res) => {
    if (typeof req.body.isEncrypted === 'undefined' || (typeof req.body.powercord === 'undefined' || typeof req.body.discord === 'undefined')) {
      return res.sendStatus(400);
    }

    const update = {
      timestamp: Date.now(),
      isEncrypted: req.body.isEncrypted
    };

    if (req.body.powercord) {
      update.powercord = req.body.powercord;
    }

    if (req.body.discord) {
      update.discord = req.body.discord;
    }

    req.db.users.updateOne({ id: req.session.user.id }, { $set: { settings: update } });
    res.sendStatus(204);
  },

  saveBadgeSettings: (req, res) => {
    const update = {};
    if (req.body.name && typeof req.body.name === 'string') {
      update.name = req.body.name;
    }

    if (req.body.color && typeof req.body.color === 'string' && (/^[a-f0-9]{3}(?:[a-f0-9]{3})?$/).test(req.body.color)) {
      update.color = req.body.color;
    }

    if (req.body.badge && typeof req.body.badge === 'string') {
      try {
        update.custom = (new URL(req.body.badge)).href;
      } catch (e) {
        // just invalid url lol
      }
    }

    if (req.body.white && typeof req.body.white === 'string') {
      try {
        update.customWhite = (new URL(req.body.white)).href;
      } catch (e) {
        // just invalid url lol
      }
    }

    req.db.users.updateOne({ id: req.session.user.id }, { $set: { badges: update } });
    res.redirect('/me');
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
      hunter: !!user.metadata.hunter,
      customization: {
        // @todo: real check
        color: (req.config.admins.includes(user.id) /* || user.donor */) && user.badges && user.badges.color ? user.badges.color : '7289da',
        custom: req.config.admins.includes(user.id) /* || user.donor */ ? (user.badges && user.badges.custom ? user.badges.custom : 'https://powercord.dev/assets/badges/donator.svg') : null,
        customWhite: req.config.admins.includes(user.id) /* || user.donor */ ? (user.badges && user.badges.customWhite ? user.badges.customWhite : 'https://powercord.dev/assets/badges/donator-w.svg') : null,
        name: req.config.admins.includes(user.id) /* || user.donor */ ? (user.badges && user.badges.name ? user.badges.name : 'Patreon Daddy') : null
      }
    });
  }
};
