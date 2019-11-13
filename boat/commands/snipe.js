const Snipe = require('../snipe');

module.exports = {
  desc: 'Snipe those sneaky fuks.',
  func: (bot, msg) => {
    if (Snipe.last.length === 0) {
      return bot.createMessage(msg.channel.id, 'There is nothing to snipe');
    }

    // @todo: send a file if too much
    bot.createMessage(msg.channel.id, {
      embed: {
        description: 'Edits and deletes for the last 10 seconds',
        fields: Snipe.last.map(snipe => ({
          name: `${snipe.author} (${snipe.type})`,
          value: snipe.msg
        })),
        footer: {
          text: `Sniped by ${msg.author.username}#${msg.author.discriminator}`
        }
      }
    });
    Snipe.last = [];
  }
};
