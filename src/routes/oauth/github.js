const { encode } = require('querystring');
const GithubOAuth = require('../../util/oauth/github');

const auth = require('../../middlewares/auth');

class GithubAuth {
  registerRoutes (express) {
    express.get('/oauth/github', auth(), this.authorize);
    express.get('/oauth/github/unlink', auth(), this.unlink);
  }

  async authorize (req, res) {
    if (!req.query.code) {
      const data = encode({
        client_id: req.config.github.clientID,
        redirect_uri: `${req.config.domain}/oauth/github`,
        show_dialog: true
      });

      return res.redirect(`https://github.com/login/oauth/authorize?${data}`);
    }

    let token;
    let user;
    try {
      token = await GithubOAuth.getToken(req.query.code);
      user = await GithubOAuth.getUserByBearer(token.access_token);
    } catch (e) {
      console.log(e);
      return res.status(500).send(`Something went wrong: <code>${e.statusCode}: ${JSON.stringify(e.body)}</code><br>If the issue persists, please join <a href='https://discord.gg/5eSH46g'>Powercord's support server</a> for assistance.`);
    }

    await req.db.users.update(req.session.user._id, {
      'accounts.github': {
        access_token: token.access_token,
        display: user.name || user.login,
        login: user.login
      }
    });

    res.redirect('/me');
  }

  async unlink (req, res) {
    await req.db.users.update(req.session.user._id, { 'accounts.github': null });
    res.redirect('/me');
  }
}

module.exports = GithubAuth;
