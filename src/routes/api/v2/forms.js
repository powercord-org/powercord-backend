const auth = require('../../../middlewares/auth');

class Forms {
  registerRoutes (express) {
    express.post('/api/v2/forms/publish', auth(), this.publish);
    express.post('/api/v2/forms/hosting', auth(), this.hosting);
    express.post('/api/v2/forms/verification', auth(), this.verification);
  }

  publish (req, res) {
    res.sendStatus(501);
  }

  hosting (req, res) {
    res.sendStatus(501);
  }

  verification (req, res) {
    res.sendStatus(501);
  }
}

module.exports = Forms;
