class Hooks {
  registerRoutes (express) {
    express.get('/webhonk/patreon', (req, res) => res.sendStatus(501));
  }
}

module.exports = Hooks;
