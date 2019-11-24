const auth = require('../../../../middlewares/auth');

class Products {
  registerRoutes (express) {
    [ 'plugins', 'themes' ].forEach(product => {
      express.post(`/api/v2/sudoers/${product}`, auth(true), this.createProduct.bind(this, product));
      express.patch(`/api/v2/sudoers/${product}/:id`, auth(true), this.updateProduct.bind(this, product));
      express.delete(`/api/v2/sudoers/${product}/:id`, auth(true), this.deleteProduct.bind(this, product));
    });
  }

  async createProduct (type, req, res) {
    res.sendStatus(501);
  }

  async updateProduct (type, req, res) {
    res.sendStatus(501);
  }

  async deleteProduct (type, req, res) {
    res.sendStatus(501);
  }
}

module.exports = Products;
