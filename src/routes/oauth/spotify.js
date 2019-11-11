const { encode } = require('querystring');
const SpotifyOAuth = require('../../util/oauth/spotify');

const auth = require('../../middlewares/auth');

class SpotifyAuth {
  registerRoutes (express) {
    express.get('/oauth/spotify', auth(), this.authorize);
    express.get('/oauth/spotify/unlink', auth(), this.unlink);
  }

  async authorize (req, res) {
    if (!req.query.code) {
      const data = encode({
        response_type: 'code',
        client_id: req.config.spotify.clientID,
        redirect_uri: `${req.config.domain}/oauth/spotify`,
        show_dialog: true,
        scope: req.config.spotify.scopes.join(' ')
      });

      return res.redirect(`https://accounts.spotify.com/authorize?${data}`);
    }

    let token;
    let user;
    try {
      token = await SpotifyOAuth.getToken(req.query.code);
      user = await SpotifyOAuth.getUserByBearer(token.access_token);
    } catch (e) {
      console.log(e);
      return res.status(500).send(`Something went wrong: <code>${e.statusCode}: ${JSON.stringify(e.body)}</code><br>If the issue persists, please join <a href='https://discord.gg/5eSH46g'>Powercord's support server</a> for assistance.`);
    }

    await req.db.users.update(req.session.user._id, {
      'accounts.spotify': {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expiryDate: Date.now() + (token.expires_in * 1000),
        name: user.display_name,
        scopes: req.config.spotify.scopes
      }
    });

    res.redirect('/me');
  }

  async unlink (req, res) {
    await req.db.users.update(req.session.user._id, { 'accounts.spotify': null });
    return res.redirect('/me');
  }
}

module.exports = SpotifyAuth;
