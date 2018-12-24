const qs = require('querystring');
const { DiscordOAuth } = require('../../rest');
const { encode } = require('../../util/jwt.js');

module.exports = async (req, res) => {
  if (!req.query.code) {
    const data = qs.encode({
      scope: 'identify',
      response_type: 'code',
      client_id: req.config.discordID,
      redirect_uri: `${req.config.domain}/oauth/discord`
    });

    return res.redirect(`https://discordapp.com/oauth2/authorize?${data}`);
  }

  let token, user;
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

  if (!await req.db.tokens.findOne({ id: user.id })) {
    await req.db.tokens.insertOne({
      id: user.id,
      discord: {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expiryDate: Date.now() + (token.expires_in * 1000)
      },
      spotify: false,
      github: false
    });
  } else {
    await req.db.tokens.updateOne({ id: user.id }, {
      $set: {
        'discord.access_token': token.access_token,
        'discord.refresh_token': token.refresh_token,
        'discord.expiryDate': Date.now() + (token.expires_in * 1000)
      }
    });
  }

  req.session.discord = user;
  res.cookie('token', await encode(user.id), {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  })
  res.redirect('/');
};
