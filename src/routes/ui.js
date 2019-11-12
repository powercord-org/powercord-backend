const auth = require('../middlewares/auth');

class UserInterface {
  registerRoutes (express) {
    express.get('/', this.render.bind(this, 'index'));
    express.get('/me', auth(), this.render.bind(this, 'me'));
    express.get('/legal/tos', this.render.bind(this, 'terms'));
    express.get('/legal/privacy', this.render.bind(this, 'privacy'));
    express.get('/branding', this.render.bind(this, 'branding'));
    express.get('/contributors', this.contributors);
    express.get('/stats', this.stats);
  }

  render (template, req, res) {
    res.render(template, req.session);
  }

  async contributors (req, res) {
    res.render('contributors', {
      contributors: await req.db.users.findContributors(),
      developers: await req.db.users.findDevelopers(),
      ...req.session
    });
  }

  async stats (req, res) {
    res.render('stats', {
      users: await req.db.users.count(),
      helpers: await req.db.users.count({ $or: [ { 'badges.contributor': true }, { 'badges.hunter': true } ] }),
      plugins: 0,
      themes: 0,
      ...req.session
    });
  }
}

module.exports = UserInterface;
