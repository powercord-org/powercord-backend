const auth = require('../../../../middlewares/auth');
const SpotifyOAuth = require('../../../../util/oauth/spotify');

class Spotify {
  registerRoutes (express) {
    express.get('/api/v2/users/@me/spotify', auth(), this.getToken);
  }

  async getToken (req, res) {
    if (!req.session.user.spotify) {
      return res.json({ token: null });
    }

    if (!req.session.user.spotify.scopes || !req.config.spotify.scopes.every(key => req.session.user.spotify.scopes.includes(key))) {
      await req.db.users.update({ id: req.session.user.id }, { spotify: null });

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
          await req.db.users.update({ id: req.session.user.id }, { spotify: null });
          return res.json({
            token: null,
            revoked: 'ACCESS_DENIED'
          });
        }
        console.log(e);
        return res.json({ token: null });
      }
      req.session.user.spotify.access_token = token.access_token;
      await req.db.users.update({ id: req.session.user.id }, {
        'spotify.access_token': token.access_token,
        'spotify.expiryDate': Date.now() + (token.expires_in * 1000)
      });
    }

    res.json({ token: req.session.user.spotify.access_token });
  }
}

module.exports = Spotify;
