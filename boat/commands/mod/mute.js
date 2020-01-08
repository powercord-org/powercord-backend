module.exports = {
  desc: 'Yeets the right to speak from a user',
  permissions: [ 'manageMessages' ],
  func: (bot, msg, config) => {
    const { guild } = msg.channel;
    const args = msg.content.split(' ').slice(1);
    const user = args.shift().replace(/<@!?(\d+)>/, '$1');
    if (user === msg.author.id) {
      return bot.createMessage(msg.channel.id, ';;');
    }
    const reason = `[${msg.author.username}#${msg.author.discriminator}] ${args.join(' ') || 'No reason specified.'}`;

    guild.addMemberRole(user, config.discord.boat.roles.mute, reason);
    bot.createMessage(msg.channel.id, 'https://epic.weeb.services/3a7d20b213.png');
  }
};
