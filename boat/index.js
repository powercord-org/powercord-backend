const Eris = require('eris');
const Snipe = require('./snipe');
const Modlog = require('./modlog');
const Starboard = require('./starboard');
const CommandHandler = require('./commandHandler');


module.exports = function (mongo, config) {
  if (!config.discord.boat.enabled) {
    return;
  }
  const bot = new Eris(config.discord.boat.token, {
    guildSubscriptions: false
  });

  bot.on('ready', () => console.log('Powercord bot is ready'));

  // Handlers
  new CommandHandler(bot, mongo, config);
  new Starboard(bot, mongo.starboard, config);
  new Modlog(bot, config);
  new Snipe(bot, config);

  // make it connect
  bot.connect();

  // @todo: Integrate with web
  return {};
};
