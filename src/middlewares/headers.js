module.exports = (req, res, done) => {
  res.setHeader('X-Powered-By', 'Potato');
  res.setHeader('Access-Control-Allow-Origin', '*');
  done();
};
