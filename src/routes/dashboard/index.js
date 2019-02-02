const ui = require('./ui');
const users = require('./users');
const processRequests = require('./process');

module.exports = {
  ui,
  users,
  process: processRequests
};
