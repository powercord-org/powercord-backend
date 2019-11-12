const auth = require('../../../../middlewares/auth');

class Settings {
  registerRoutes (express) {
    express.get('/api/v2/users/@me/settings', auth(), this.getSettings.bind(this));
    express.put('/api/v2/users/@me/settings', auth(), this.setSettings.bind(this));
  }

  getSettings (req, res) {
    res.json(req.session.user.settings || {
      isEncrypted: false,
      powercord: null,
      discord: null
    });
  }

  setSettings (req, res) {
    if (typeof req.body.isEncrypted !== 'boolean' || (typeof req.body.powercord !== 'string' && typeof req.body.discord !== 'string')) {
      return res.sendStatus(400);
    }

    const update = {
      timestamp: Date.now(),
      isEncrypted: req.body.isEncrypted,
      powercord: req.body.powercord,
      discord: req.body.discord
    };

    req.db.users.update(req.session.user._id, { settings: update });
    res.sendStatus(204);
  }
}

module.exports = Settings;
