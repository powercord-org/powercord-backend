const { secret } = require('../../config.json');

const { sign, verify } = (() => {
  const { sign: s, verify: v } = require('jsonwebtoken');
  const { promisify } = require('util');
  return {
    sign: promisify(s),
    verify: promisify(v)
  };
})();

module.exports = {
  encode (obj) {
    return sign(obj, secret, { algorithm: 'HS512' });
  },
  decode (jwt) {
    return verify(jwt, secret, { algorithms: [ 'HS512' ] });
  }
};
