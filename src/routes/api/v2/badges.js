class Badges {
  registerRoutes (express) {
    express.get('/api/v2/guilds/badges', this.badges);
  }

  async badges (req, res) {
    const badges = await req.db.badges.findAll();
    res.json(
      badges.reduce((acc, badge) => {
        acc[badge._id] = {
          name: badge.name,
          icon: badge.icon
        };
        return acc;
      }, {})
    );
  }
}

module.exports = Badges;
