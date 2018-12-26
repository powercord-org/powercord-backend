const { sign, verify } = (() => {
  const { sign: s, verify: v } = require('jsonwebtoken');
  const { promisify } = require('util');
  return {
    sign: promisify(s),
    verify: promisify(v)
  };
})();

const { pub, priv } = (() => {
  const { readFileSync } = require('fs');
  return {
    pub: readFileSync('public.pem', 'utf8'),
    priv: readFileSync('private.key', 'utf8')
  };
})();

module.exports = {
  encode (obj) {
    return sign(obj, priv, { algorithm: 'RS256' });
  },
  decode (jwt) {
    return verify(jwt, pub, { algorithms: [ 'RS256' ] });
  }
};
