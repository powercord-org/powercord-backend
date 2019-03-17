const { get } = require('../../../util/http');

module.exports = {
  grabLastCommit: async (req, res) => {
    const html = await get(`https://github.com/${req.params.owner}/${req.params.repo}/commits/${req.params.branch}`).then(r => r.body);
    const commitData = html.match(/<clipboard-copy(?:.*)value="([a-f0-9]{40})"/);
    if (!commitData) {
      return res.sendStatus(404);
    }

    res.json({ commit: commitData[1] });
  }
};
