const { ObjectId } = require('mongodb');

module.exports = {
  v1: {
    getPlugins: async (req, res) => {
      const plugins = await req.db.plugins.find({ manifest: { $not: { $eq: null } } }).skip((req.query.page || 0) * 20).limit(20).toArray();
      res.json(plugins.map(p => ({
        _id: p._id,
        id: p.name,
        ...p.manifest
      })));
    },

    getPlugin: async (req, res) => {
      let plugin;
      if (ObjectId.isValid(req.params.id)) {
        plugin = await req.db.plugins.findOne({
          _id: new ObjectId(req.params.id),
          manifest: { $not: { $eq: null } }
        });
      } else {
        plugin = await req.db.plugins.findOne({
          name: req.params.id,
          manifest: { $not: { $eq: null } }
        });
      }

      if (!plugin) {
        return res.status(404).json({
          status: 404,
          error: 'Not found'
        });
      }

      res.json({
        id: plugin.name,
        ...plugin.manifest
      });
    }
  }
};
