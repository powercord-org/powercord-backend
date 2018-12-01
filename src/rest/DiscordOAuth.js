const { get, post } = require('../http/');
const config = require('../config.json');

module.exports = {
  BASE_URL: 'https://discordapp.com/api/v7',

  getBearer (code) {
    return post(`${this.BASE_URL}/oauth2/token`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        client_id: config.discordID,
        client_secret: config.discordSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${config.domain}/auth/discordcb`
      }).then(r => r.body);
  },

  getUserByBearer (bearer) {
    return get(`${this.BASE_URL}/users/@me`)
      .set('Authorization', `Bearer ${bearer}`)
      .then(r => r.body);
  }
};