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
  app.get('/legal/privacy', (req, res) => res.render('privacy', req.session));
  app.get('/legal/tos', (req, res) => res.render('terms', req.session));
  app.get('/contributors', contributors);

  // Dashboard routes - RESTful hahayes
  app.get('/dashboard', authMiddleware.admin, (_, res) => res.redirect('/dashboard/announcements'));

  app.get('/dashboard/announcements', (req, res) => res.render('dashboard/announcements', {
    ...req.session,
    current: 'announcements'
  }));

  app.get('/dashboard/changelogs', (req, res) => res.render('dashboard/changelogs', {
    ...req.session,
    current: 'changelogs'
  }));

  app.get('/dashboard/plugins', authMiddleware.admin, dashboard.plugins.ui.list);
  app.get('/dashboard/plugins/create', authMiddleware.admin, dashboard.ui.create);
  app.post('/dashboard/plugins/create', authMiddleware.admin, dashboard.process.create);
  app.get('/dashboard/plugins/edit/:id', authMiddleware.admin, dashboard.ui.edit);
  app.post('/dashboard/plugins/edit/:id', authMiddleware.admin, dashboard.process.edit);
  app.get('/dashboard/plugins/edit/:id/developers', authMiddleware.admin, dashboard.ui.edit);
  app.post('/dashboard/plugins/edit/:id/developers', authMiddleware.admin, dashboard.process.edit);
  app.get('/dashboard/plugins/delete/:id', authMiddleware.admin, dashboard.process.delete);

  app.get('/dashboard/themes', (req, res) => res.render('dashboard/themes', {
    ...req.session,
    current: 'themes'
  }));

  app.get('/dashboard/users', authMiddleware.admin, dashboard.users.ui);
  app.post('/dashboard/users', authMiddleware.admin, dashboard.users.process);

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

  // Webhooks
  app.post('/hook/github/:id', authMiddleware.github, hook.github);
  app.post('/hook/patreon/:id', authMiddleware.github, hook.patreon);

  // API - RESTfuler than the dashboard
  v1.call(this, app, '/api/v1');
  v1.call(this, app, '/api');
};
