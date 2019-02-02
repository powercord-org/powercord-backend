const { auth } = require('../../middlewares/auth');
const { v1: pluginsV1 } = require('./plugins');
const { v1: usersV1 } = require('./users');

module.exports = {
  v1: (app, basePath) => {
    app.get(`${basePath}/plugins`, pluginsV1.getPlugins);
    app.get(`${basePath}/plugins/:id`, pluginsV1.getPlugin);

    app.get(`${basePath}/users/@me`, auth, usersV1.getMe);
    app.get(`${basePath}/users/@me/settings`, auth, usersV1.getSettings);
    app.post(`${basePath}/users/@me/settings`, auth, usersV1.saveSettings);
    app.get(`${basePath}/users/link`, usersV1.link);
    app.get(`${basePath}/users/:id`, usersV1.getSomeone);
  }
};
