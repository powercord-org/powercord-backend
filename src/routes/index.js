const authMiddleware = require('../middlewares/auth');

const contributors = require('./contributors');
const dashboard = require('./dashboard');
const discord = require('./oauth/discord');
const spotify = require('./oauth/spotify');
const github = require('./oauth/github');

const hook = require('./hook');

const { v1 } = require('./api');

/*
 * @todo: CSRF tokens
 * @todo: Allow ppl to register their themes
 */
module.exports = (app) => {
  // UI routes
  app.get('/', (req, res) => res.render('index', req.session));
  app.get('/me', (req, res) => res.render('me', req.session));
  app.get('/contributors', contributors);

  // Dashboard routes - RESTful hahayes
  app.get('/dashboard', authMiddleware.admin, dashboard.ui.plugins);
  app.get('/dashboard/create', authMiddleware.admin, dashboard.ui.create);
  app.post('/dashboard/create', authMiddleware.admin, dashboard.process.create);
  app.get('/dashboard/edit/:id', authMiddleware.admin, dashboard.ui.edit);
  app.post('/dashboard/edit/:id', authMiddleware.admin, dashboard.process.edit);
  app.get('/dashboard/delete/:id', authMiddleware.admin, dashboard.process.delete);

  app.get('/dashboard/users', authMiddleware.admin, dashboard.ui.users);
  app.post('/dashboard/users', authMiddleware.admin, dashboard.process.users);

  // Oauth routes
  app.get('/oauth/discord', discord.authorize);
  app.get('/oauth/spotify', authMiddleware.auth, spotify.authorize);
  app.get('/oauth/github', authMiddleware.auth, github.authorize);
  app.get('/oauth/discord/unlink', authMiddleware.auth, discord.unlink);
  app.get('/oauth/spotify/unlink', authMiddleware.auth, spotify.unlink);
  app.get('/oauth/github/unlink', authMiddleware.auth, github.unlink);
  app.get('/logout', authMiddleware.auth, (req, res) => {
    res.cookie('token', '', { maxAge: -1 });
    delete req.session.jwt;
    res.redirect('/');
  });

  // Github Webhook
  app.post('/hook/:id', authMiddleware.github, hook);

  // API - RESTfuler than the dashboard
  v1.call(this, app, '/api/v1');
  v1.call(this, app, '/api');

  // hahayes
  app.get('/coffee', (_, res) => res.sendStatus(418));
};
