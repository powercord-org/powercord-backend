const { get, post } = require('../http');
const config = require('../../config.json');

module.exports = {
  BASE_URL: 'https://discordapp.com/api/v7',

  getOrRefreshToken (props) {
    return post(`${this.BASE_URL}/oauth2/token`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        client_id: config.discordID,
        client_secret: config.discordSecret,
        redirect_uri: `${config.domain}/oauth/discord`,
        ...props
      }).then(r => r.body);
  },

  getToken (code) {
    return this.getOrRefreshToken({
      grant_type: 'authorization_code',
      code
    });
  },

  refreshToken (refresh_token) {
    return this.getOrRefreshToken({
      grant_type: 'refresh_token',
      refresh_token
    });
  },

  getUserByBearer (bearer) {
    return get(`${this.BASE_URL}/users/@me`)
      .set('Authorization', `Bearer ${bearer}`)
      .then(r => r.body);
  }
};
