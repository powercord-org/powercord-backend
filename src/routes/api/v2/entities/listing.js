const auth = require('../../../../middlewares/auth');

class Listing {
  registerRoutes (express) {
    [ 'plugins', 'themes' ].forEach(entity => {
      express.get(`/api/v2/${entity}`, auth(true), this.listEntities.bind(this, entity, false));
      express.get(`/api/v2/${entity}/listing`, auth(true), this.listEntities.bind(this, entity, true));
    });
  }

  async listEntities (type, consent, req, res) {
    res.sendStatus(501);
  }
}

module.exports = Listing;
