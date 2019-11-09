const auth = require('../../../../middlewares/auth');

class Forms {
  registerRoutes (express) {
    express.get('/api/v2/sudoers/forms', auth(true), this.getForms);
    express.post('/api/v2/sudoers/forms/:id', auth(true), this.updateForm);
  }

  getForms (req, res) {
    res.sendStatus(501);
  }

  updateForm (req, res) {
    res.sendStatus(501);
  }
}

module.exports = Forms;
