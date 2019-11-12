const auth = require('../../../middlewares/auth');

class Forms {
  constructor () {
    this.reportReasons = {
      shared: [ 'SPAM', 'THREAT', 'NSFW', 'INAPPROPRIATE' ],
      entities: [ 'OUTDATED' ],
      reviews: [ 'IRRELEVANT' ]
    };
  }

  registerRoutes (express) {
    express.post('/api/v2/forms/publish', auth(), this.publish.bind(this));
    express.post('/api/v2/forms/hosting', auth(), this.hosting.bind(this));
    express.post('/api/v2/forms/verification', auth(), this.verification.bind(this));

    express.post('/api/v2/reports/reasons', auth(), this.reasons.bind(this));
    express.post('/api/v2/reports/plugins/:id', auth(), this.report.bind(this, 'plugins'));
    express.post('/api/v2/reports/themes/:id', auth(), this.report.bind(this, 'themes'));
    express.post('/api/v2/reports/reviews/:id', auth(), this.report.bind(this, 'reviews'));
  }

  publish (req, res) {
    this._handleForm(req, res, 'publish', [ 'content', 'repo' ]);
  }

  hosting (req, res) {
    this._handleForm(req, res, 'hosting', [ 'content', 'repo', 'domain' ]);
  }

  verification (req, res) {
    this._handleForm(req, res, 'verification', [ 'content', 'repo' ]);
  }

  reasons (req, res) {
    res.json(this.reportReasons);
  }

  async report (type, req, res) {
    const reasons = this.reportReasons.shared;
    if (type === 'plugins' || type === 'themes') {
      reasons.push(...this.reportReasons.entities);
    } else {
      reasons.push(...this.reportReasons.reviews);
    }

    // Does the reported entity exists?
    const entity = await req.db[type].find(req.params.id);
    if (!entity) {
      return res.sendStatus(404);
    }

    // Maximum 5 reports opened, to prevent spam
    if (await req.db.forms.count({ userId: req.session.user._id }) >= 5) {
      return res.sendStatus(429);
    }

    if (typeof req.body.reason !== 'string' || !reasons.includes(req.body.reasons) || typeof req.body.content !== 'string') {
      return res.sendStatus(400);
    }

    await req.db.forms.create({
      userId: req.session.user._id,
      category: 'reports',
      reason: req.body.reason,
      content: req.body.content,
      type
    });
    res.sendStatus(204);
  }

  async _handleForm (req, res, type, fields) {
    // Maximum 5 forms opened, to prevent spam
    if (await req.db.forms.count({ userId: req.session.user._id }) >= 5) {
      return res.sendStatus(429);
    }

    const data = {
      userId: req.session.user._id,
      category: 'forms',
      type
    };
    for (const field of fields) {
      if (typeof req.body[field] !== 'string') {
        return req.sendStatus(400);
      }
      data[field] = req.body[field];
    }

    await req.db.forms.create(data);
    res.sendStatus(204);
  }
}

module.exports = Forms;
