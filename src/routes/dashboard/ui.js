module.exports = {
  async plugins (req, res) {
    res.render('dashboard/index', {
      items: await req.db.plugins.find({}).toArray(),
      current: 'plugins',
      ...req.session
    })
  },

  async contributors (req, res) {
    res.render('dashboard/index', {
      items: await req.db.users.find({}).toArray(),
      current: 'contributors',
      ...req.session
    })
  }
};
