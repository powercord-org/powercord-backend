const settings = {
  getSettings: async (req, res) => {
    res.json(req.session.user.settings || {
      isEncrypted: false,
      powercord: null,
      discord: null
    });
  },

  updateSettings: async (req, res) => {
    if (typeof req.body.isEncrypted === 'undefined' || (typeof req.body.powercord === 'undefined' && typeof req.body.discord === 'undefined')) {
      return res.sendStatus(400);
    }

    const update = {
      timestamp: Date.now(),
      isEncrypted: req.body.isEncrypted
    };

    if (req.body.powercord) {
      update.powercord = req.body.powercord;
    }

    if (req.body.discord) {
      update.discord = req.body.discord;
    }

    req.db.users.updateOne({ id: req.session.user.id }, { $set: { settings: update } });
    res.sendStatus(204);
  }
};

module.exports = settings;
