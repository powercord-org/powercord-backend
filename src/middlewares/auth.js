const { createHmac } = require('crypto');

let handledPayloads = [];

module.exports = {
  auth (req, res, next) {
    if (!req.session.discord) {
      return res.status(401).send('You must be authenticated to see this. <a href=\'/\'>Home</a>');
    }
    next();
  },

  admin (req, res, next) {
    // Just checking isAdmin would be sufficient, but won't send the good status code
    if (!req.session.discord) {
      return res.status(401).send('You must be authenticated to see this. <a href=\'/\'>Home</a>');
    }
    if (!req.session.isAdmin) {
      return res.status(403).send('You\'re not allowed to see this. <a href=\'/\'>Home</a>');
    }
    next();
  },

  github (req, res, next) {
    if (!req.headers['x-github-delivery']) {
      return res.sendStatus(400);
    }

    // Check if already received
    if (handledPayloads.includes(req.headers['x-github-delivery'])) {
      return res.sendStatus(200);
    }
    handledPayloads = [ req.headers['x-github-delivery'], ...handledPayloads.slice(0, 9) ];

    // Check user agent
    if (!req.headers['user-agent'].startsWith('GitHub-Hookshot/')) {
      return res.sendStatus(403);
    }

    // Check signature
    const sig = createHmac('sha1', req.config.secret).update(req.rawBody).digest('hex');
    if (req.headers['x-hub-signature'] !== `sha1=${sig}`) {
      return res.sendStatus(403);
    }

    next();
  }
};
