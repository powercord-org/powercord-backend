const auth = require('../../../../middlewares/auth');

class Manage {
  registerRoutes (express) {
    [ 'plugins', 'themes' ].forEach(product => {
      express.put(`/api/v2/${product}/:id`, auth(true), this.updateProduct.bind(this, product));
      express.delete(`/api/v2/${product}/:id`, auth(true), this.deleteProduct.bind(this, product));
    });
  }

  async updateProduct (type, req, res) {
    res.sendStatus(501);
  }

  async deleteProduct (type, req, res) {
    res.sendStatus(501);
  }
}

module.exports = Manage;
