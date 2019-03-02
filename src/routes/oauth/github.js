const { encode } = require('querystring');
const { GithubOAuth } = require('../../util/rest');

module.exports = {
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
      return res.status(500).send(`Something went wrong: <code>${e.statusCode}: ${JSON.stringify(e.body)}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Powercord's support server</a> for assistance.`);
    }

    await req.db.users.updateOne({ id: req.session.discord.id }, {
      $set: {
        'metadata.github': user.login,
        github: {
          access_token: token.access_token,
          name: user.name
        }
      }
    });

    req.session.github = user;
    res.redirect('/me');
  },

  async unlink (req, res) {
    delete req.session.github;
    await req.db.users.updateOne({ id: req.session.discord.id }, {
      $set: {
        'metadata.github': null,
        github: null
      }
    });
    return res.redirect('/me');
  }
};
