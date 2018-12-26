const authMiddleware = require('../middlewares/auth')

const contributors = require('./contributors')
const dashboard = require('./dashboard')
const discord = require('./oauth/discord')
const spotify = require('./oauth/spotify')
const github = require('./oauth/github')

// @todo: CSRF tokens
module.exports = (app) => {
  // UI routes
  app.get('/', (req, res) => res.render('index', req.session));
  app.get('/contributors', contributors);

  // Dashboard routes - REST hahayes
  app.get('/dashboard', authMiddleware.admin, dashboard.ui.plugins);
  app.get('/dashboard/create', authMiddleware.admin, dashboard.ui.create);
  app.post('/dashboard/create', authMiddleware.admin, dashboard.process.create);
  app.get('/dashboard/edit/:id', authMiddleware.admin, dashboard.ui.edit);
  app.post('/dashboard/edit/:id', authMiddleware.admin, dashboard.process.edit);
  app.get('/dashboard/delete/:id', authMiddleware.admin, dashboard.process.delete);

  app.get('/dashboard/contributors', authMiddleware.admin, dashboard.ui.contributors);
  app.post('/dashboard/contributors', authMiddleware.admin, dashboard.process.contributors);

  // Oauth routes
  app.get('/oauth/discord', discord.authorize);
  app.get('/oauth/spotify', authMiddleware.auth, spotify.authorize);
  app.get('/oauth/github', authMiddleware.auth, github.authorize);
  app.get('/oauth/discord/unlink', authMiddleware.auth, discord.unlink);
  app.get('/oauth/spotify/unlink', authMiddleware.auth, spotify.unlink);
  app.get('/oauth/github/unlink', authMiddleware.auth, github.unlink);
  app.get('/logout', authMiddleware.auth, (req, res) => {
    res.cookie('token', '', { maxAge: -1 });
    req.session.discord = undefined;
    res.redirect('/');
  });

  // API - RESTer than the dashboard
}

/*
module.exports = require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .map(filename => require(`${__dirname}/${filename}`));
  */
