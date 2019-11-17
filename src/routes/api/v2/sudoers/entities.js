const auth = require('../../../../middlewares/auth');

class Entities {
  registerRoutes (express) {
    [ 'plugins', 'themes' ].forEach(entity => {
      express.post(`/api/v2/sudoers/${entity}`, auth(true), this.createEntity.bind(this, entity));
      express.patch(`/api/v2/sudoers/${entity}/:id`, auth(true), this.updateEntity.bind(this, entity));
      express.delete(`/api/v2/sudoers/${entity}/:id`, auth(true), this.deleteEntity.bind(this, entity));
    });
  }

  async createEntity (type, req, res) {
    res.sendStatus(501);
  }

  async updateEntity (type, req, res) {
    res.sendStatus(501);
  }

  async deleteEntity (type, req, res) {
    res.sendStatus(501);
  }
}

module.exports = Entities;
