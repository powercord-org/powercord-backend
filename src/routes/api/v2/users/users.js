const auth = require('../../../../middlewares/auth');

class Users {
  registerRoutes (express) {
    express.get('/api/v2/users/@me', auth(), this.getSelf);
    express.get('/api/v2/users/:id', this.getOther);
  }

  async getSelf (req, res) {
    res.json({
      id: req.session.user.id,
      connections: {
        spotify: (req.session.user.spotify && req.session.user.spotify.name) ? req.session.user.spotify.name : null,
        github: (req.session.user.github && req.session.user.github.name) ? req.session.user.github.name : null
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

    // I use !! just to make sure value is present in payload, even if we define it by default. Never too safe #RS256
    res.json({
      rank: {
        developer: !!user.metadata.developer,
        contributor: !!user.metadata.contributor,
        early: !!user.metadata.early,
        tester: !!user.metadata.tester,
        hunter: !!user.metadata.hunter
      },
      banned: user.banned,
      badge: {
        // @todo: real check
        displayBadge: user.badges && user.badges.custom, // req.config.admins.includes(user.id) /* || user.donor */,
        color: user.badges && user.badges.color ? user.badges.color : null,
        custom: user.badges && user.badges.custom ? user.badges.custom : null,
        customWhite: user.badges && user.badges.customWhite ? user.badges.customWhite : null,
        name: user.badges && user.badges.name ? user.badges.name : null
      }
    });
  }
}

module.exports = Users;
