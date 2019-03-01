const { ObjectId } = require('mongodb');
const { get } = require('../util/http');

const manifestKeys = [ 'name', 'version', 'description', 'author', 'license' ];

module.exports = {
  patreon: (req, res) => { // eslint-disable-line
    // @todo: donor checking
  },

  github: async (req, res) => {
    if (req.body.repository.owner.login !== req.config.githubOrg) {
      return res.sendStatus(400);
    }

    res.sendStatus(200); // just send 200
    if (req.headers['x-github-event'] === 'push') {
      if (req.body.ref === 'refs/heads/master') {
        await new Promise(r => setTimeout(r, 60000)); // ensure cdn is updated
        try {
          const rawManifest = await get(`https://raw.githubusercontent.com/${req.body.repository.full_name}/master/manifest.json?nocache=${Date.now()}`).then(r => r.body);
          const manifest = JSON.parse(rawManifest);

          if (manifestKeys.every(key => manifest.hasOwnProperty(key))) {
            await req.db.plugins.updateOne({ _id: new ObjectId(req.params.id) }, {
              $set: { manifest }
            });
          }
        } catch (e) {}
      }
    }
  }
};
