const logout = require('../../middlewares/session/logout');

class Logout {
  registerRoutes (express) {
    express.get('/logout', (req, res) => {
      logout(req, res);
      res.redirect('/');
    });
  }
}

module.exports = Logout;
