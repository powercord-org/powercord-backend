module.exports = {
  desc: 'Read the damn rules...',
  func: async (bot, msg, config) => {
    const id = parseInt(msg.content.split(' ')[1]) || 0;
    const rules = await bot.getMessage(config.discord.boat.rules[0], config.discord.boat.rules[1]);
    const match = rules.content.match(new RegExp(`\\[0?${id}] ([^\\d]*)`));
    if (!match) {
      return bot.createMessage(msg.channel.id, 'Rule not found.');
    }

    const rule = match[1].split('\n').map(s => s.trim()).join(' ');
    bot.createMessage(msg.channel.id, `**Rule #${id}**: ${rule.slice(0, rule.length - 2)}`);
  }
};
