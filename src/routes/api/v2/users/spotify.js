const auth = require('../../../../middlewares/auth');
const SpotifyOAuth = require('../../../../util/oauth/spotify');

class Spotify {
  registerRoutes (express) {
    express.get('/api/v2/users/@me/spotify', auth(), this.getToken.bind(this));
  }

  async getToken (req, res) {
    if (!req.session.user.accounts.spotify) {
      return res.json({ token: null });
    }

    if (!req.session.user.accounts.spotify.scopes || !req.config.spotify.scopes.every(key => req.session.user.accounts.spotify.scopes.includes(key))) {
      await req.db.users.update(req.session.user._id, { spotify: null });

      return res.json({
        token: null,
        revoked: 'SCOPES_UPDATED'
      });
    }

    if (Date.now() >= req.session.user.accounts.spotify.expiryDate) {
      let token;
      try {
        token = await SpotifyOAuth.refreshToken(req.session.user.accounts.spotify.refresh_token);
      } catch (e) {
        if (e.statusCode < 500) {
          await req.db.users.update(req.session.user._id, { spotify: null });
          return res.json({
            token: null,
            revoked: 'ACCESS_DENIED'
          });
        }
        console.log(e);
        return res.json({ token: null });
      }
      req.session.user.accounts.spotify.access_token = token.access_token;
      await req.db.users.update(req.session.user._id, {
        'accounts.spotify.access_token': token.access_token,
        'accounts.spotify.expiryDate': Date.now() + (token.expires_in * 1000)
      });
    }

    res.json({ token: req.session.user.accounts.spotify.access_token });
  }
}

module.exports = Spotify;
