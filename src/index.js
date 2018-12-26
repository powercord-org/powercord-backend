const { resolve, join } = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

const config = require('../config.json');
const routes = require('./routes');

(async () => {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', join(__dirname, '/views'));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: false
  }));

  app.use(await require('./middlewares/context.js')());
  app.use(require('./middlewares/session.js'));
  app.use('/assets', express.static(resolve(__dirname, '..', 'static')));
  routes.call(this, app);

  app.listen(config.port, () => {
    console.log(`Express server listening to ${config.port}.`);
  });
})();
