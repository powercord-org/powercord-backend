const { get, post } = require('../http');
const config = require('../../config.json');

module.exports = {
  BASE_URL: 'https://github.com/login/oauth',
  BASE_ME_URL: 'https://api.github.com/user',

  getOrRefreshToken (props) {
    return post(`${this.BASE_URL}/access_token`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .send({
        client_id: config.githubID,
        client_secret: config.githubSecret,
        redirect_uri: `${config.domain}/oauth/github`,
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
    return get(this.BASE_ME_URL)
      .set('Authorization', `token ${bearer}`)
      .then(r => r.body);
  }
};
