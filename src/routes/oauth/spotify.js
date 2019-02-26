const { encode } = require('querystring');
const { SpotifyOAuth } = require('../../rest');

module.exports = {
  async authorize (req, res) {
    if (!req.query.code) {
      const data = encode({
        response_type: 'code',
        client_id: req.config.spotifyID,
        redirect_uri: `${req.config.domain}/oauth/spotify`,
        show_dialog: true,
        scope: [
          'user-read-currently-playing',
          'user-modify-playback-state',
          'user-read-playback-state',
          'playlist-read-private',
          'user-library-read',
          'user-library-modify'
          'playlist-modify-public',
          'playlist-modify-private'
        ].join(' ')
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
      return res.status(500).send(`Something went wrong: <code>${e.statusCode}: ${JSON.stringify(e.body)}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Powercord's support server</a> for assistance.`);
    }

    await req.db.users.updateOne({ id: req.session.discord.id }, {
      $set: {
        spotify: {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expiryDate: Date.now() + (token.expires_in * 1000)
        }
      }
    });

    req.session.spotify = user;
    res.redirect('/me');
  },

  async unlink (req, res) {
    delete req.session.spotify;
    await req.db.users.updateOne({ id: req.session.discord.id }, {
      $set: {
        spotify: null
      }
    });
    return res.redirect('/me');
  }
};
