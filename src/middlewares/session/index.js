const login = require('./login');
const logout = require('./logout');
const discord = require('./discord');
const refresh = require('./refresh');

module.exports = async (req, res, next) => {
  if (!await login(req, res)) {
    logout(req, res);
    return next();
  }

  if (!await discord(req, res)) {
    logout(req, res);
    return next();
  }

  if (!await refresh(req, res)) {
    logout(req, res);
    return next();
  }

  next();
};
