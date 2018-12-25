const { encode } = require('querystring');
const { GithubOAuth } = require('../../rest');

module.exports = {
  async authorize (req, res) {
    if (!req.query.code) {
      const data = encode({
        client_id: req.config.githubID,
        redirect_uri: `${req.config.domain}/oauth/github`,
        show_dialog: true,
        scope: req.query.write ? 'repo' : ''
      });

      return res.redirect(`https://github.com/login/oauth/authorize?${data}`);
    }

    let token, user;
    try {
      token = await GithubOAuth.getToken(req.query.code);
      user = await GithubOAuth.getUserByBearer(token.access_token);
    } catch (e) {
      console.log(e);
      return res.status(500).send(`Something went wrong: <code>${e.statusCode}: ${JSON.stringify(e.body)}</code><br>If the issue persists, please join <a href="https://discord.gg/Yphr6WG">Powercord's support server</a> for assistance.`);
    }

    await req.db.users.updateOne({ id: req.session.discord.id }, {
      $set: {
        github: {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expiryDate: Date.now() + (token.expires_in * 1000)
        }
      }
    });

    req.session.github = user;
    res.redirect('/');
  },

  async unlink (req, res) {
    req.session.github = undefined;
    await req.db.users.updateOne({ id: req.session.discord.id }, {
      $set: {
        github: null
      }
    });
    return res.redirect('/');
  }
};
