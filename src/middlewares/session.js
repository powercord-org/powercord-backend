const { decode } = require('../util/jwt');
const { DiscordOAuth, SpotifyOAuth } = require('../rest');

module.exports = async (req, res, next) => {
  req.session.isAdmin = false;
  if (res.cookies && res.cookies.token) {
    let userId;
    try {
      userId = await decode(res.cookies.token)
    } catch (err) {
      switch (err.message) {
        case 'invalid signature':
        case 'jwt malformed':
          res.cookie('token', '', { maxAge: -1 });
          return next();
        default:
          throw err;
      }
    }

    req.session.isAdmin = req.config.admins.includes(userId);
    const doc = await req.db.tokens.findOne({ id: userId });
    if (!doc) {
      res.cookie('token', '', { maxAge: -1 });
      return next();
    }
    const { discord, spotify, github } = doc;

    // Discord (oauth)
    if (Date.now() >= discord.expiryDate) {
      const tokens = await SpotifyOAuth.refreshToken(discord.refresh_token);
      discord.access_token = tokens.access_token;
      await req.db.tokens.updateOne({ id: userId }, {
        $set: {
          'discord.access_token': discord.access_token,
          'discord.expiryDate': Date.now() + (discord.expires_in * 1000)
        }
      });
    }

    // Discord
    if (!req.session.discord) {
      const user = await DiscordOAuth.getUserByBearer(discord.access_token);
      if (!user.id) {
        res.cookie('token', '', { maxAge: -1 });
        return next();
      }
      req.session.discord = user;
    }

    if (spotify) {
      // Spotify (oauth)
      if (Date.now() >= spotify.expiryDate) {
        const tokens = await SpotifyOAuth.refreshToken(spotify.refresh_token);
        spotify.access_token = tokens.access_token;
        await req.db.tokens.updateOne({ id: userId }, {
          $set: {
            'spotify.access_token': tokens.access_token,
            'spotify.expiryDate': Date.now() + (tokens.expires_in * 1000)
          }
        });
      }

      // Spotify
      if (!req.session.spotify) {
        req.session.spotify = await SpotifyOAuth.getUserByBearer(spotify.access_token)
      }
    }

    // Github (@todo)
  }
  next();
};
