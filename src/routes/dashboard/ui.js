const { ObjectId } = require('mongodb');

module.exports = {
  async plugins (req, res) {
    if (!req.session.github || req.session.user.github.scope === '') {
      return res.redirect('/oauth/github?write');
    }

    res.render('dashboard/index', {
      items: await req.db.plugins.aggregate([ {
        $lookup: {
          from: 'users',
          localField: 'developer',
          foreignField: 'id',
          as: 'user'
        }
      } ]).toArray(),
      current: 'plugins',
      ...req.session
    });
  },

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
  },

  async users (req, res) {
    res.render('dashboard/index', {
      items: await req.db.users.find({}).toArray(),
      current: 'users',
      ...req.session
    });
  }
};
