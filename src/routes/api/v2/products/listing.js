const auth = require('../../../../middlewares/auth');

class Listing {
  registerRoutes (express) {
    [ 'plugins', 'themes' ].forEach(product => {
      express.get(`/api/v2/${product}`, auth(true), this.listProducts.bind(this, product, false));
      express.get(`/api/v2/${product}/listing`, auth(true), this.listProducts.bind(this, product, true));
    });
  }

  async listProducts (type, consent, req, res) {
    res.sendStatus(501);
  }
}

module.exports = Listing;
