const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const config = require('./config.json');
const routes = require('./routes/');
const getDB = require('./db.js');

(async () => {
  const db = await getDB();
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: false
  }));

  for (const route of routes) {
    route.call(this, app, config, db);
  }

  app.listen(config.port, () => {
    console.log(`Express server listening to ${config.port}.`);
  });
})();