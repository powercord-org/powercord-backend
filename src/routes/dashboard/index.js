const ui = require('./ui');
const users = require('./users');
const plugins = require('./plugins');
const processRequests = require('./process');

module.exports = {
  ui,
  users,
  plugins,
  process: processRequests
};
