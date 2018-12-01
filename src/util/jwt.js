const { sign, verify } = (() => {
  const { sign, verify } = require('jsonwebtoken');
  const { promisify } = require('util');
  return {
    sign: promisify(sign),
    verify: promisify(verify)
  }
})();

const { public, private } = (() => {
  const { readFileSync } = require('fs');
  return {
    public: readFileSync('../public.pem', 'utf8'),
    private: readFileSync('../private.key', 'utf8')
  }
})();

module.exports = {
  encode (obj) {
    return sign(obj, private, { algorithm: 'RS256' });
  },
  decode (jwt) {
    return verify(jwt, public, { algorithms: [ 'RS256' ]});
  }
};
