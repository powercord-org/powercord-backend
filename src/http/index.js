const GenericRequest = require('./GenericRequest.js');

module.exports = {
  get (url) {
    return new GenericRequest('GET', url);
  },
  post (url) {
    return new GenericRequest('POST', url);
  },
  put (url) {
    return new GenericRequest('PUT', url);
  },
  patch (url) {
    return new GenericRequest('PATCH', url);
  },
  del (url) { // delete is a reserved keyword
    return new GenericRequest('DELETE', url);
  }
};
