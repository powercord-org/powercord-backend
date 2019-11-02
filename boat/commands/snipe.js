const Snipe = require('../snipe');

module.exports = {
  func: (bot, msg) => {
    if (Snipe.last) {
      bot.createMessage(msg.channel.id, `**Author**: \`${Snipe.last.author}\`\n${Snipe.last.messages.map(m => `\`${m.msg}\` (${m.type})`).join('\n')}\n\n👀 Sniped by \`${msg.author.username}#${msg.author.discriminator}\``);
      Snipe.last = null;
    } else {
      bot.createMessage(msg.channel.id, 'There is nothing to snipe');
    }
  }
};
