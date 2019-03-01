const { ObjectId } = require('mongodb');

module.exports = {
  async create (req, res) {
    res.render('dashboard/editor', {
      create: true,
      item: {
        name: '',
        developer: ''
      },
      ...req.session
    });
  },

  async edit (req, res) {
    const item = await req.db.plugins.findOne({ _id: new ObjectId(req.params.id) });
    if (!item) {
      return res.redirect('/dashboard');
    }

    res.render('dashboard/editor', {
      create: false,
      item,
      ...req.session
    });
  }
};
