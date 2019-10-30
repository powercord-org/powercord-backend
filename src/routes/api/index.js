const { auth } = require('../../middlewares/auth');
const pluginsV1 = require('./v1/plugins');
const usersV1 = require('./v1/users');
const badgesV1 = require('./v1/badges');
const entitiesV1 = require('./v1/admin/entities');

const utilsV2 = require('./v2/utils');

module.exports = {
  v2: (app, basePath) => {
    app.get(`${basePath}/plug/:color([a-fA-F0-9]{6})`, utilsV2.recolorPlug);
    app.get(`${basePath}/cute/:id(\\d+)`, utilsV2.cute);
  },
  v1: (app, basePath) => {
    // Util API stuff
    app.get(`${basePath}/plug/:color([a-fA-F0-9]{6})`, (req, res) => res.redirect(req.path.replace('/v1', '/v2')));

    // Public API
    app.get(`${basePath}/users/@me`, auth, usersV1.getMe);
    app.get(`${basePath}/users/@me/spotify`, auth, usersV1.getSpotify);
    app.get(`${basePath}/users/@me/settings`, auth, usersV1.getSettings);
    app.post(`${basePath}/users/@me/settings`, auth, usersV1.saveSettings);
    app.post(`${basePath}/users/@me/settings/badges`, auth, usersV1.saveBadgeSettings);

    app.get(`${basePath}/users/link`, usersV1.link);
    app.get(`${basePath}/users/:id`, usersV1.getSomeone);

    app.get(`${basePath}/badges`, badgesV1);

    app.get(`${basePath}/plugins`, pluginsV1.getPlugins);
    app.get(`${basePath}/plugins/:id`, pluginsV1.getPlugin);

    // Admin API
    app.get(`${basePath}/weebs/plugins`, entitiesV1.listEntities('plugins'));
    app.post(`${basePath}/weebs/plugins`, entitiesV1.createEntity('plugins'));
    app.put(`${basePath}/weebs/plugins/:id`, entitiesV1.updateEntity('plugins'));
    app.patch(`${basePath}/weebs/plugins/:id`, entitiesV1.updateEntity('plugins'));
    app.delete(`${basePath}/weebs/plugins/:id`, entitiesV1.deleteEntity('plugins'));
  }
};
