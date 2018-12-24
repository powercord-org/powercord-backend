// const { SpotifyOAuth } = require('../rest/');
// const { decode } = require('../util/jwt.js');

module.exports = (app, config, db) => {
  // UI routes
  app.get('/', (_, res) => res.render('index'))

  // Oauth routes

  // API
}

/*
module.exports = require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .map(filename => require(`${__dirname}/${filename}`));
  */
