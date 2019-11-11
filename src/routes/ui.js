const auth = require('../middlewares/auth');

class UserInterface {
  registerRoutes (express) {
    express.get('/', this.render.bind(this, 'index'));
    express.get('/me', auth(), this.render.bind(this, 'me'));
    express.get('/legal/tos', this.render.bind(this, 'terms'));
    express.get('/legal/privacy', this.render.bind(this, 'privacy'));
    express.get('/branding', this.render.bind(this, 'branding'));
    express.get('/contributors', this.contributors);
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
}

module.exports = UserInterface;
