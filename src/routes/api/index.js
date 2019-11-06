// @todo: write this better once we've got rid of v1 code (with some dynamic stuff)

const { auth } = require('../../middlewares/auth');
const pluginsV1 = require('./v1/plugins');
const usersV1 = require('./v1/users');
const entitiesV1 = require('./v1/admin/entities');

const utilsV2 = require('./v2/utils');
const aprilV2 = require('./v2/april');
const docsV2 = require('./v2/docs');
const usersV2 = require('./v2/users/user');
const usersSpotifyV2 = require('./v2/users/spotify');
const usersSettingsV2 = require('./v2/users/settings');
const usersLinkV2 = require('./v2/users/link');
const badgesV2 = require('./v2/badges');

module.exports = {
  v2: (app, basePath) => {
    // Stuff
    app.get(`${basePath}/plug/:color([a-fA-F0-9]{6})`, utilsV2.recolorPlug);
    app.get(`${basePath}/cute/:id(\\d+)`, utilsV2.cute);
    app.get(`${basePath}/april`, aprilV2);

    // Documentation
    app.get(`${basePath}/docs/categories`, docsV2.categories);
    app.get(`${basePath}/docs/:category/:doc`, docsV2.document);

    // Plugin & Themes
    [ 'plugins', 'themes' ].forEach(entity => {
      // CRUD
      app.get(`${basePath}/${entity}`, (_, res) => res.sendStatus(501));
      app.post(`${basePath}/${entity}`, (_, res) => res.sendStatus(501));
      app.put(`${basePath}/${entity}/:id`, (_, res) => res.sendStatus(501));
      app.delete(`${basePath}/${entity}/:id`, (_, res) => res.sendStatus(501));

      // Search/dep tree
      app.get(`${basePath}/${entity}/search`, (_, res) => res.sendStatus(501));
      app.get(`${basePath}/${entity}/:id/dependency_tree`, (_, res) => res.sendStatus(501));

      // Reviews
      app.get(`${basePath}/${entity}/:id/reviews`, (_, res) => res.sendStatus(501));
      app.post(`${basePath}/${entity}/:id/reviews`, (_, res) => res.sendStatus(501));
      app.delete(`${basePath}/${entity}/:id/reviews/:r_id`, (_, res) => res.sendStatus(501));

      // Reporting
      app.post(`${basePath}/${entity}/report`, (_, res) => res.sendStatus(501));
      app.post(`${basePath}/${entity}/report/reviews/:r_id`, (_, res) => res.sendStatus(501));
    });

    // Forms
    app.post(`${basePath}/forms/publish`, (_, res) => res.sendStatus(501));
    app.post(`${basePath}/forms/hosting`, (_, res) => res.sendStatus(501));

    // Users
    app.get(`${basePath}/users/@me`, auth, usersV2.getSelfUser);
    app.get(`${basePath}/users/:id`, usersV2.getUser);
    app.get(`${basePath}/users/@me/spotify`, auth, usersSpotifyV2);
    app.get(`${basePath}/users/@me/settings`, auth, usersSettingsV2.getSettings);
    app.put(`${basePath}/users/@me/settings`, auth, usersSettingsV2.updateSettings);
    app.put(`${basePath}/users/@me/badges`, (_, res) => res.sendStatus(501));
    app.get(`${basePath}/users/@me/link`, usersLinkV2);

    // Admin
    app.get(`${basePath}/sudoers/forms`, (_, res) => res.sendStatus(501));
    app.post(`${basePath}/sudoers/forms/:id`, (_, res) => res.sendStatus(501));
    app.get(`${basePath}/sudoers/reports`, (_, res) => res.sendStatus(501));
    app.post(`${basePath}/sudoers/reports/:id`, (_, res) => res.sendStatus(501));

    // Server Badges
    app.get(`${basePath}/badges`, badgesV2);

    // Webhooks
    app.put(`${basePath}/webhonk/patreon`, (_, res) => res.sendStatus(501));
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

    app.get(`${basePath}/badges`, (req, res) => res.redirect(req.path.replace('/v1', '/v2')));

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
