const pluginsRoutes = {
  ui: {
    list: async (req, res) => {
      res.render('dashboard/plugins', {
        items: await req.db.plugins.aggregate([ {
          $lookup: {
            from: 'users',
            localField: 'developer',
            foreignField: 'id',
            as: 'user'
          }
        } ]).toArray(),
        ...req.session,
        current: 'plugins'
      });
    }
  },

  process: {
    meta: () => {

    },

    developers: () => {

    },

    remove: () => {

    }
  }
};

module.exports = pluginsRoutes;
