const authMiddleware = require('../middlewares/auth');

const contributors = require('./contributors');
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
  app.post('/gibmoneytodaddy', hook.patreon);

  // API
  v1.call(this, app, '/api/v1');
  v1.call(this, app, '/api');
};
