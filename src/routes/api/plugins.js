const { ObjectId } = require('mongodb');

module.exports = {
  v1: {
    getPlugins: async (req, res) => {
      const plugins = await req.db.plugins.find({ manifest: { $not: { $eq: null } } }).skip((req.query.page || 0) * 20).limit(20).toArray();
      res.json(plugins.map(p => ({
        id: p._id,
        ...p.manifest
      })));
    },

    getPlugin: async (req, res) => {
      const plugin = await req.db.plugins.findOne({
        _id: new ObjectId(req.params.id),
        manifest: { $not: { $eq: null } }
      });

      if (!plugin) {
        return res.status(404).json({
          status: 404,
          error: 'Not found'
        });
      }

      res.json({
        id: plugin._id,
        ...plugin.manifest
      });
    }
  }
};
