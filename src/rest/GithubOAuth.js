const { get, post } = require('../http');
const config = require('../../config.json');

module.exports = {
  BASE_URL: 'https://github.com/login/oauth',
  BASE_ME_URL: 'https://api.github.com/user',

  getToken (code) {
    return post(`${this.BASE_URL}/access_token`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .send({
        client_id: config.githubID,
        client_secret: config.githubSecret,
        redirect_uri: `${config.domain}/oauth/github`,
        grant_type: 'authorization_code',
        code
      }).then(r => r.body);
  },

  getUserByBearer (bearer) {
    return get(this.BASE_ME_URL)
      .set('Authorization', `token ${bearer}`)
      .then(r => r.body);
  }
};
