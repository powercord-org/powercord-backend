module.exports = (app) =>
  app.use((err, req, res, next) => {
    console.error(err.body);
    res.status(500).send('fucky wucky ' + err.message);
  });
