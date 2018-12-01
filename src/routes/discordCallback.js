const { DiscordOAuth } = require('../rest/');

module.exports = (app, config, db) =>
  app.get('/auth/discordcb', async (req, res) => {
    if (!req.query.code) {
      return res.status(400).send('Missing code querystring');
    }

    const bearer = await DiscordOAuth.getBearer(req.query.code);
    if (bearer.error) {
      return res.status(500).send(`Something went wrong: <code>${bearer.error}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Aethcord's support server</a> for assistance.`);
    }

    const user = await DiscordOAuth.getUserByBearer(bearer.access_token);
    if (!user.id) {
      return res.status(500).send(`Something went wrong: <code>${user.message}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Aethcord's support server</a> for assistance.`);
    }

    if (await db.findOne({ id: user.id })) {
      await db.removeOne({ id: user.id });
    }

    req.session.user = user;

    res.redirect('/auth/spotify');
  });
