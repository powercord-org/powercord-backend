const auth = require('../../../../middlewares/auth');

class Manage {
  registerRoutes (express) {
    [ 'plugins', 'themes' ].forEach(entity => {
      express.put(`/api/v2/${entity}/:id`, auth(true), this.updateEntity.bind(this, entity));
      express.delete(`/api/v2/${entity}/:id`, auth(true), this.deleteEntity.bind(this, entity));
    });
  }

  async updateEntity (type, req, res) {
    res.sendStatus(501);
  }

  async deleteEntity (type, req, res) {
    res.sendStatus(501);
  }
}

module.exports = Manage;
