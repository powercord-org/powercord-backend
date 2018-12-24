// const { SpotifyOAuth } = require('../rest/');
// const { decode } = require('../util/jwt.js');

module.exports = (app) => {
  // UI routes
  app.get('/', (req, res) => res.render('index', req.session));

  // Oauth routes
  app.get('/oauth/discord', require('./oauth/discord'));
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
