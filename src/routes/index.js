const discord = require('./oauth/discord')
const spotify = require('./oauth/spotify')
const github = require('./oauth/github')

module.exports = (app) => {
  // UI routes
  app.get('/', (req, res) => res.render('index', req.session));

  // Oauth routes
  app.get('/oauth/discord', discord);
  app.get('/oauth/spotify', spotify.authorize);
  app.get('/oauth/github', github.authorize);
  app.get('/oauth/spotify/unlink', spotify.unlink);
  app.get('/oauth/github/unlink', github.unlink);
  app.get('/logout', (req, res) => {
    res.cookie('token', '', { maxAge: -1 });
    res.redirect('/');
  });

  // API
}

/*
module.exports = require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .map(filename => require(`${__dirname}/${filename}`));
  */
