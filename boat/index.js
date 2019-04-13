const Eris = require('eris');
const Starboard = require('./starboard');

const no = [
  'no',
  'NO',
  'nice try',
  'banned',
  'ur not cute enough',
  'this command have been blocked due to article 13. Sorry.'
];

const getNo = () => no[Math.floor(Math.random() * no.length)];

module.exports = function (mongo, config) {
  const bot = new Eris(config.discord.boat.token);

  bot.on('ready', () => console.log('Powercord bot is ready'));

  bot.on('messageCreate', msg => {
    const isAdmin = config.admins.includes(msg.author.id);

    if (msg.content === 'pc/invite') {
      return bot.createMessage(msg.channel.id, '<:peepoGnome:563129237398224916>');
    }

    if (!isAdmin) {
      return;
    }

    if (msg.content.startsWith(config.discord.boat.prefix)) {
      const args = msg.content.slice(config.discord.boat.prefix.length).split(' ');

      switch (args[0]) {
        case 'ping':
          const startTime = Date.now();
          bot.createMessage(msg.channel.id, '🏓 Pong!').then(m => {
            const restLatency = Date.now() - startTime;
            m.edit(`🏓 Pong! | REST: ${restLatency}ms - Gateway: ${bot.shards.get(0).latency}ms`);
          });
          break;

        case 'sync':
          if (!isAdmin) {
            return bot.createMessage(msg.channel.id, getNo());
          }
          // @todo: Sync
          bot.createMessage(msg.channel.id, 'coming soon');
          break;

        case 'createCmd':
          if (!isAdmin) {
            return bot.createMessage(msg.channel.id, getNo());
          }
          // @todo: Custom commands
          bot.createMessage(msg.channel.id, 'coming soon');
          break;

        case 'editCmd':
          if (!isAdmin) {
            return bot.createMessage(msg.channel.id, getNo());
          }
          // @todo: Custom commands
          bot.createMessage(msg.channel.id, 'coming soon');
          break;

        case 'delCmd':
          if (!isAdmin) {
            return bot.createMessage(msg.channel.id, getNo());
          }
          // @todo: Custom commands
          bot.createMessage(msg.channel.id, 'coming soon');
          break;

        default:
          // @todo: Custom commands
          break;
      }
    }
  });

  // Starboard
  new Starboard(bot, mongo, config);

  // make it connect
  bot.connect();

  // @todo: Integrate with web
  return {};
};
