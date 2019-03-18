const { auth } = require('../../middlewares/auth');
const pluginsV1 = require('./v1/plugins');
const usersV1 = require('./v1/users');
// const utilsV1 = require('./v1/utils');

module.exports = {
  v1: (app, basePath) => {
    // Util API stuff

    // app.get(`${basePath}/commit/:owner/:repo/:branch`, utilsV1.grabLastCommit);

    // Public API
    app.get(`${basePath}/users/link`, usersV1.link);
    app.get(`${basePath}/users/:id`, usersV1.getSomeone);

    app.get(`${basePath}/users/@me`, auth, usersV1.getMe);
    app.get(`${basePath}/users/@me/spotify`, auth, usersV1.getSpotify);
    app.get(`${basePath}/users/@me/settings`, auth, usersV1.getSettings);
    app.post(`${basePath}/users/@me/settings`, auth, usersV1.saveSettings);
    app.post(`${basePath}/users/@me/settings/badges`, auth, usersV1.saveBadgeSettings);

    app.get(`${basePath}/plugins`, pluginsV1.getPlugins);
    app.get(`${basePath}/plugins/:id`, pluginsV1.getPlugin);

    // Admin API
  }
};
