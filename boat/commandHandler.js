const commands = require('./commands');

const no = [
  'no',
  'NO',
  'nice try',
  'banned',
  'ur too cute for those weapons',
  'this command has been blocked due to article ~~13~~17. Sorry.',
  'friendly reminder that you\'re not allowed to run that command',
  'go plant trees instead <https://teamtrees.org>'
];

module.exports = class CommandHandler {
  constructor (bot, mongo, config) {
    this.mongo = mongo;
    this.config = config;
    this.bot = bot;

    bot.on('messageCreate', this.processCommand.bind(this));
  }

  get no () {
    return no[Math.floor(Math.random() * no.length)];
  }

  processCommand (msg) {
    if (msg.channel.recipient || this.config.discord.boat.stupid.includes(msg.author.id)) {
      return;
    }

    const isAdmin = this.config.admins.includes(msg.author.id);
    if (!msg.content.startsWith(this.config.discord.boat.prefix)) {
      return;
    }

    const args = msg.content.slice(this.config.discord.boat.prefix.length).split(' ');
    const command = commands[args[0]];

    if (command) {
      if (command.isAdmin && !isAdmin) {
        return this.bot.createMessage(msg.channel.id, this.no);
      }
      const permissions = typeof command.permissions === 'function' ? command.permissions(msg) : command.permissions;
      if (permissions && !permissions.every(p => msg.member.permission.has(p))) {
        return this.bot.createMessage(msg.channel.id, this.no);
      }

      return command.func(this.bot, msg, this.config, this.mongo);
    }
  }
};
