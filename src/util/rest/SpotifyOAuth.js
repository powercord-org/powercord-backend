const { get, post } = require('../http');
const config = require('../../../config.json');

module.exports = {
  BASE_URL: 'https://accounts.spotify.com/api',
  BASE_ME_URL: 'https://api.spotify.com/v1/me',

  getOrRefreshToken (props) {
    return post(`${this.BASE_URL}/token`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Basic ${Buffer.from(`${config.spotify.clientID}:${config.spotify.clientSecret}`).toString('base64')}`)
      .send({
        redirect_uri: `${config.domain}/oauth/spotify`,
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
      .set('Authorization', `Bearer ${bearer}`)
      .then(r => r.body);
  }
};
