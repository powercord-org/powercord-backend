const { jwt: { decode } } = require('../util');
const DiscordOAuth = require('../util/oauth/discord');

module.exports = async (req, res, next) => {
  try {
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
          case 'invalid algorithm':
          case 'jwt malformed':
            res.cookie('token', '', { maxAge: -1 });
            return next();
          default:
            // noinspection ExceptionCaughtLocallyJS
            throw err;
        }
      }

      req.session.user = await req.db.users.findOne({ id: userId });
      if (!req.session.user) {
        res.cookie('token', '', { maxAge: -1 });
        return next();
      }

      req.session.jwt = token;
      req.session.isAdmin = req.config.admins.includes(userId);
      const { discord } = req.session.user;

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
          delete req.session.jwt;
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
    }

    // @todo: real check
    req.session.isDonor = req.session.isAdmin; // || req.session.user.donor;
    return next();
  } catch (e) {
    console.error(e);
    res.status(500).send('this is so sad alexa play despacito');
  }
};
