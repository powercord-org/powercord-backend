class Badges {
  registerRoutes (express) {
    express.get('/api/v2/guilds/badges', this.badges.bind(this));
  }

  async badges (req, res) {
    res.json(await req.db.badges.findAllAsKV());
  }
}

module.exports = Badges;
