const { SpotifyOAuth } = require('../rest/');
const { get } = require('../http/');
const { encode } = require('../util/jwt.js');

module.exports = (app, config, db) =>
  app.get('/auth/spotifycb', async (req, res, next) => {
    if (!req.session.user) {
      return res.status(412).send(`No user profile found in session. Start at <a href="/link">${config.domain}/link<a>.<br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Powercord's support server</a> for assistance.`);
    }

    const token = await SpotifyOAuth.getToken('aaa' ).catch(next);
    const user = await SpotifyOAuth.getUserByBearer(token.access_token).catch(next);
    
    const jwt = await encode({ id: req.session.user.id });

    await db.insertOne({
      id: req.session.user.id,
      auth: {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expiryDate: Date.now() + (token.expires_in * 1000)
      }
    });

    res.status(200).send(`Here's your token:<br><br><code>${jwt}</code>`);
  });
