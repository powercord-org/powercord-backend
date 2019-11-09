const auth = require('../../../../middlewares/auth');

class Reports {
  registerRoutes (express) {
    express.get('/api/v2/sudoers/reports', auth(true), this.getReports);
    express.post('/api/v2/sudoers/reports/:id', auth(true), this.updateReport);
  }

  getReports (req, res) {
    res.sendStatus(501);
  }

  updateReport (req, res) {
    res.sendStatus(501);
  }
}

module.exports = Reports;
