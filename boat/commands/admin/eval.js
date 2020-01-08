// stolen from https://github.com/aetheryx/spotify-connect/blob/master/src/commands/eval.js
const { inspect } = require('util');

// noinspection JSUnusedLocalSymbols
module.exports = {
  isAdmin: true,
  desc: 'fucks up the bot and reveals token.',
  // eslint-disable-next-line no-unused-vars
  func: async (bot, msg, config, mongo) => {
    const script = msg.content.slice(config.discord.boat.prefix.length + 5);
    if (!script) {
      return bot.createMessage(msg.channel.id, 'undefined ¯\\_(ツ)_/¯');
    }
    const m = await bot.createMessage(msg.channel.id, '<a:loading:660094837437104138> Computing...');
    const start = Date.now();

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

    const processing = ((Date.now() - start) / 1000).toFixed(2);
    if (result.length > 1900) {
      return m.edit('result too long. and hastebin upload not implemented. yes.');
    }
    m.edit(`\`\`\`js\n${result}\n\`\`\`\nTook ${processing} seconds.`);
  }
};
