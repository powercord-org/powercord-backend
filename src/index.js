const { resolve, join } = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

const config = require('../config.json');
const getDB = require('./db');
const boat = require('../boat');
const routes = require('./routes');

(async () => {
  const database = await getDB();
  const boatInstance = boat(database, config);
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', join(__dirname, '/views'));
  app.use(bodyParser.json({
    verify: (req, _, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  app.use(cookieParser());
  app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: false
  }));

  app.use(await require('./middlewares/context.js')(database, boatInstance));
  app.use(require('./middlewares/session'));
  app.use('/assets', express.static(resolve(__dirname, '..', 'static')));
  routes.call(this, app);

  // Express requires the method to take 4 args in order to be an error handler
  app.use((err, req, res, _) => { // eslint-disable-line no-unused-vars
    console.error(err);
    res.status(500).send(`fucky wucky ${err.message}`);
  });

  app.listen(config.port, () => {
    console.log(`Express server listening to ${config.port}.`);
  });
})();
