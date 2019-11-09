const auth = require('../middlewares/auth');

class UserInterface {
  registerRoutes (express) {
    express.get('/', this.render.bind(this, 'index'));
    express.get('/tos', this.render.bind(this, 'tos'));
    express.get('/privacy', this.render.bind(this, 'privacy'));
    express.get('/contributors', this.contributors);
    express.get('/me', auth(), this.render.bind(this, 'me'));
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
