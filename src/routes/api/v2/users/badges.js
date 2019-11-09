const auth = require('../../../../middlewares/auth');

class Badges {
  registerRoutes (express) {
    express.post('/api/v2/users/@me/badges', auth(), this.updateBadges);
  }

  updateBadges (req, res) {
    res.sendStatus(501);
  }
}

module.exports = Badges;

/* eslint-disable */
/*
module.exports = {
  saveBadgeSettings: (req, res) => {
    const update = {};
    if (req.body.name && typeof req.body.name === 'string') {
      update.name = req.body.name;
    }

    if (req.body.color && typeof req.body.color === 'string' && (/^[a-f0-9]{3}(?:[a-f0-9]{3})?$/).test(req.body.color)) {
      update.color = req.body.color;
    }

    if (req.body.badge && typeof req.body.badge === 'string') {
      try {
        update.custom = (new URL(req.body.badge)).href;
      } catch (e) {
        // just invalid url lol
      }
    }

    if (req.body.white && typeof req.body.white === 'string') {
      try {
        update.customWhite = (new URL(req.body.white)).href;
      } catch (e) {
        // just invalid url lol
      }
    }

    req.db.users.updateOne({ id: req.session.user.id }, { $set: { badges: update } });
    res.sendStatus(204);
  }
};
 */
