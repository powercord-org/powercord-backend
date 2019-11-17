const { get } = require('../../src/util/http');

module.exports = {
  desc: 'Imagine reading guidelines...',
  func: async (bot, msg) => {
    const id = parseInt(msg.content.split(' ')[1]) || 0;
    const guidelines = await get('https://raw.githubusercontent.com/powercord-community/guidelines/new-guidelines/README.md').then(r => r.body);
    const match = guidelines.match(new RegExp(`# (${id}[^#]*)`));
    if (!match) {
      return bot.createMessage(msg.channel.id, 'Guideline not found.');
    }

    const guideline = match[0].slice(2).split('\n\n');
    guideline[0] = `**Guideline #${guideline[0]}**`;
    bot.createMessage(msg.channel.id, guideline.map(g => g.replace(/\n/g, '')).join('\n\n'));
  }
};
