const { encode } = require('querystring');

module.exports = (app, config, db) => {
  const params = encode({
    response_type: 'code',
    client_id: config.spotifyID,
    redirect_uri: `${config.domain}/auth/spotifycb`,
    show_dialog: true,
    scope: [
      'user-read-currently-playing',
      'user-modify-playback-state',
      'user-read-playback-state',
      'playlist-read-private',
      'user-library-read'
    ].join(' ')
  });

  app.get('/auth/spotify', async (req, res) => {
    if (!req.session.user) {
      return res.status(412).send(`No user profile found in session. Start at <a href="/link">${config.domain}/link<a>.<br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Aethcord's support server</a> for assistance.`);
    }

    res.redirect(`https://accounts.spotify.com/authorize?${params}`);
  });
};
