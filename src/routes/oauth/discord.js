const qs = require('querystring');
const { encode } = require('../../util/jwt');
const DiscordOAuth = require('../../util/oauth/discord');

const auth = require('../../middlewares/auth');
const logout = require('../../middlewares/session/logout');

class DiscordAuth {
  registerRoutes (express) {
    express.get('/oauth/discord', this.authorize);
    express.get('/oauth/discord/unlink', auth(), this.unlink);
  }

  async authorize (req, res) {
    if (!req.query.code) {
      const data = qs.encode({
        scope: 'identify',
        response_type: 'code',
        client_id: req.config.discord.clientID,
        redirect_uri: `${req.config.domain}/oauth/discord`
      });

      return res.redirect(`https://discord.com/oauth2/authorize?${data}`);
    }

    let token;
    let user;
    try {
      token = await DiscordOAuth.getToken(req.query.code);
      if (token.error) {
        return res.status(500).send(`Something went wrong: <code>${token.error}</code><br>If the issue persists, please join <a href='https://discord.gg/5eSH46g'>Powercord's support server</a> for assistance.`);
      }

      user = await DiscordOAuth.getUserByBearer(token.access_token);
      if (!user.id) {
        return res.status(500).send(`Something went wrong: <code>${user.message}</code><br>If the issue persists, please join <a href='https://discord.gg/5eSH46g'>Powercord's support server</a> for assistance.`);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(`Something went wrong: <code>${e.statusCode}: ${JSON.stringify(e.body)}</code><br>If the issue persists, please join <a href='https://discord.gg/5eSH46g'>Powercord's support server</a> for assistance.`);
    }

    const banned = req.db.users.findBanned(user.id);
    if (banned.account) {
      return res.status(403).send('Sorry not sorry, you\'ve been banned. <a href="/">Go home</a>');
    }

    if (!await req.db.users.find(user.id)) {
      await req.db.users.create({
        _id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
          : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`,
        accounts: {
          discord: {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expiryDate: Date.now() + (token.expires_in * 1000)
          }
        }
      });
    } else {
      await req.db.users.update(user.id, {
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
          : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`,
        'accounts.discord': {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expiryDate: Date.now() + (token.expires_in * 1000)
        }
      });
    }

    req.session.discord = user;
    res.cookie('token', await encode(user.id), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    });
    res.redirect(req.session._redirect || '/me');
    delete req.session._redirect;
  }

  async unlink (req, res) {
    if (req.session.discord) {
      await req.db.users.delete(req.session.user._id);
      logout(req, res);
    }
    return res.redirect('/');
  }
}

module.exports = DiscordAuth;
