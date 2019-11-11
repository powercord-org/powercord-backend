module.exports = {
  permissions: [ 'manageMessages' ],
  func: (bot, msg, config) => {
    const { guild } = msg.channel;
    const args = msg.content.split(' ').slice(1);
    const user = args.shift().replace(/<@!?(\d+)>/, '$1');
    const reason = `[${msg.author.username}#${msg.author.discriminator}] ${args.join(' ') || 'No reason specified.'}`;

    guild.removeMemberRole(user, config.discord.boat.roles.mute, reason);
    bot.createMessage(msg.channel.id, 'ok');
  }
};
