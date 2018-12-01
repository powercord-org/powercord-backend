const { SpotifyOAuth } = require('../rest/');
const { decode } = require('../util/jwt.js');

module.exports = (app, config, db) =>
  app.post('/accessToken', async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(401).send('Missing token');
    }

    let id;
    try {
      ({ id } = await decode(token));
    } catch (err) {
      switch (err.message) {
        case 'invalid signature':
        case 'jwt malformed':
          return res.status(401).send('Invalid token');

        default:
          throw err;
      }
    }

    const { auth } = await db.findOne({ id });

    if (Date.now() >= auth.expiryDate) {
      const tokens = await SpotifyOAuth.refreshToken(auth.refresh_token);
      auth.access_token = tokens.access_token;
      await db.updateOne({ id }, {
        $set: {
          'auth.access_token': tokens.access_token,
          'auth.expiryDate': Date.now() + (tokens.expires_in * 1000)
        }
      });
    }

    return res.status(200).send(auth.access_token);
  });
