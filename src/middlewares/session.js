const { decode } = require('../util/jwt');
const { DiscordOAuth, SpotifyOAuth, GithubOAuth } = require('../rest');

module.exports = async (req, res, next) => {
  req.session.isAdmin = false;
  if (req.cookies.token || req.headers.authorization) {
    const token = req.cookies.token || req.headers.authorization;
    let userId;
    try {
      userId = await decode(token);
    } catch (err) {
      console.log(err);
      switch (err.message) {
        case 'invalid signature':
        case 'jwt malformed':
          res.cookie('token', '', { maxAge: -1 });
          delete req.session.discord;
          return next();
        default:
          throw err;
      }
    }

    req.session.jwt = token;
    req.session.isAdmin = req.config.admins.includes(userId);
    req.session.tokens = await req.db.users.findOne({ id: userId });
    if (!req.session.tokens) {
      res.cookie('token', '', { maxAge: -1 });
      delete req.session.discord;
      return next();
    }
    const { discord, spotify, github } = req.session.tokens;

    // Discord (oauth)
    if (Date.now() >= discord.expiryDate) {
      const tokens = await DiscordOAuth.refreshToken(discord.refresh_token);
      discord.access_token = tokens.access_token;
      await req.db.users.updateOne({ id: userId }, {
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
        delete req.session.discord;
        return next();
      }

      // Save username/avatars
      await req.db.users.updateOne({ id: user.id }, {
        $set: {
          'metadata.username': user.username,
          'metadata.discriminator': user.discriminator,
          'metadata.avatar': user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
            : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`
        }
      });

      req.session.discord = user;
    }

    if (spotify) {
      // Spotify (oauth)
      if (Date.now() >= spotify.expiryDate) {
        const tokens = await SpotifyOAuth.refreshToken(spotify.refresh_token);
        spotify.access_token = tokens.access_token;
        await req.db.users.updateOne({ id: userId }, {
          $set: {
            'spotify.access_token': tokens.access_token,
            'spotify.expiryDate': Date.now() + (tokens.expires_in * 1000)
          }
        });
      }

      // Spotify
      if (!req.session.spotify) {
        req.session.spotify = await SpotifyOAuth.getUserByBearer(spotify.access_token);
      }
    }

    // Github
    if (github) {
      if (!req.session.github) {
        const user = await GithubOAuth.getUserByBearer(github.access_token);
        if (user) {
          await req.db.users.updateOne({ id: user.id }, {
            $set: {
              'metadata.github': user.login
            }
          });
          req.session.github = user;
        }
      }
    }
  }
  next();
};
