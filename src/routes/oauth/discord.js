const qs = require('querystring');
const { DiscordOAuth } = require('../../rest');
const { encode } = require('../../util/jwt.js');

module.exports = {
  async authorize (req, res) {
    if (!req.query.code) {
      const data = qs.encode({
        scope: 'identify',
        response_type: 'code',
        client_id: req.config.discordID,
        redirect_uri: `${req.config.domain}/oauth/discord`
      });

      return res.redirect(`https://discordapp.com/oauth2/authorize?${data}`);
    }

    let token;
    let user;
    try {
      token = await DiscordOAuth.getToken(req.query.code);
      if (token.error) {
        return res.status(500).send(`Something went wrong: <code>${token.error}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Powercord's support server</a> for assistance.`);
      }

      user = await DiscordOAuth.getUserByBearer(token.access_token);
      if (!user.id) {
        return res.status(500).send(`Something went wrong: <code>${user.message}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Powercord's support server</a> for assistance.`);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(`Something went wrong: <code>${e.statusCode}: ${JSON.stringify(e.body)}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Powercord's support server</a> for assistance.`);
    }

    if (!await req.db.users.findOne({ id: user.id })) {
      await req.db.users.insertOne({
        id: user.id,
        metadata: {
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
            : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`,
          contributor: false,
          developer: false,
          github: null
        },
        discord: {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expiryDate: Date.now() + (token.expires_in * 1000)
        },
        spotify: false,
        github: false
      });
    } else {
      await req.db.users.updateOne({ id: user.id }, {
        $set: {
          'metadata.username': user.username,
          'metadata.discriminator': user.discriminator,
          'metadata.avatar': user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
            : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`,
          discord: {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expiryDate: Date.now() + (token.expires_in * 1000)
          }
        }
      });
    }

    req.session.discord = user;
    res.cookie('token', await encode(user.id), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    });
    res.redirect('/');
  },

  async unlink (req, res) {
    if (req.session.discord) {
      if (typeof req.query.confirm === 'undefined' && (req.session.tokens.metadata.contributor || req.session.tokens.metadata.developer)) {
        return res.send('You\'ll lose your contributor/developer role if you continue. We just wanted to make sure you\'re aware of that. <a href=\'?confirm\'>I\'m sure</a>');
      }
      await req.db.users.deleteOne({ id: req.session.tokens.id });
      res.cookie('token', '', { maxAge: -1 });
      delete req.session.discord;
    }
    return res.redirect('/');
  }
};
