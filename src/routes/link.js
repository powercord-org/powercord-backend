const { encode } = require('querystring');

module.exports = (app, config) => {
  const data = encode({
    scope: 'identify',
    response_type: 'code',
    client_id: config.discordID,
    redirect_uri: `${config.domain}/auth/discordcb`
  });

  app.get('/', (_, res) => {
    res.redirect(`https://discordapp.com/oauth2/authorize?${data}`);
  });
};