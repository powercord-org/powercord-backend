// stolen from https://github.com/aetheryx/spotify-connect/blob/master/src/commands/eval.js
const { inspect } = require('util');

module.exports = {
  isAdmin: true,
  func: async (bot, msg, config) => {
    const script = msg.content.slice(config.discord.boat.prefix.length + 5);
    if (!script) {
      return bot.createMessage(msg.channel.id, 'undefined ¯\\_(ツ)_/¯');
    }

    let result;
    try {
      // eslint-disable-next-line no-eval
      result = await eval(
        script.includes('await')
          ? `(async () => { ${script} })()`
          : script
      );
    } catch (err) {
      result = err;
    }

    const plsNoSteal = RegExp(`${config.discord.clientSecret}|${config.discord.boat.token}`);
    result = inspect(result, { depth: 1 }).replace(plsNoSteal, 'very.secret.token');

    bot.createMessage(msg.channel.id, `\`\`\`js\n${result}\n\`\`\``);
  }
};
