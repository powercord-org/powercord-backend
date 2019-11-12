const auth = require('../../../../middlewares/auth');

class Users {
  registerRoutes (express) {
    express.get('/api/v2/users/@me', auth(), this.getSelf.bind(this));
    express.get('/api/v2/users/:id', this.getOther.bind(this));
  }

  async getSelf (req, res) {
    res.json({
      id: req.session.user._id,
      connections: {
        spotify: (req.session.user.accounts.spotify && req.session.user.accounts.spotify.name) ? req.session.user.accounts.spotify.name : null,
        github: (req.session.user.accounts.github && req.session.user.accounts.github.display) ? req.session.user.accounts.github.display : null
      },
      banned: await req.db.users.findBanned(req.session.user.id)
    });
  }

  async getOther (req, res) {
    const user = await req.db.users.findWithBanned(req.params.id);
    console.log(user);

    if (!user) {
      return res.sendStatus(404);
    }

    res.json({
      badges: user.badges,
      banned: user.banned
    });
  }
}

module.exports = Users;
