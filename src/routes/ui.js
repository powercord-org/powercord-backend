const marked = require('marked');
const { get } = require('../util/http');
const auth = require('../middlewares/auth');

class UserInterface {
  registerRoutes (express) {
    express.get('/', this.render.bind(this, 'index'));
    express.get('/me', auth(), this.render.bind(this, 'me'));
    express.get('/legal/tos', this.render.bind(this, 'terms'));
    express.get('/legal/privacy', this.render.bind(this, 'privacy'));
    express.get('/branding', this.render.bind(this, 'branding'));
    express.get('/contributors', this.contributors.bind(this));
    express.get('/stats', this.stats.bind(this));
    express.get('/installation', this.installation.bind(this));
    express.get('/guidelines', this.guidelines.bind(this));
  }

  render (template, req, res) {
    res.render(template, req.session);
  }

  async contributors (req, res) {
    res.render('contributors', {
      contributors: await req.db.users.findContributors(),
      developers: await req.db.users.findDevelopers(),
      ...req.session
    });
  }

  async stats (req, res) {
    res.render('stats', {
      users: await req.db.users.count(),
      helpers: await req.db.users.count({ $or: [ { 'badges.contributor': true }, { 'badges.hunter': true } ] }),
      plugins: 0,
      themes: 0,
      ...req.session
    });
  }

  installation (req, res) {
    this._markdown(req, res, 'https://raw.githubusercontent.com/wiki/powercord-org/powercord/Installation.md', 'Installation');
  }

  guidelines (req, res) {
    this._markdown(req, res, 'https://raw.githubusercontent.com/powercord-community/guidelines/new-guidelines/README.md', 'Powercord Community Guidelines');
  }

  async _markdown (req, res, file, title) {
    let markdown = await get(file).then(r => r.body);
    if (markdown.startsWith(`# ${title}`)) {
      markdown = markdown.split('\n').slice(2).join('\n');
    } else {
      markdown = markdown.replace(/^#/gm, '##');
    }

    res.render('markdown', {
      title,
      markdown: marked.parse(markdown)
    });
  }
}

module.exports = UserInterface;
