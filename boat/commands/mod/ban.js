module.exports = {
  desc: 'Bans a member.',
  permissions: [ 'banMembers' ],
  func: (bot, msg) => {
    const { guild } = msg.channel;
    const args = msg.content.split(' ').slice(1);
    const user = args.shift().replace(/<@!?(\d+)>/, '$1');
    if (user === msg.author.id) {
      return bot.createMessage(msg.channel.id, ';;');
    }
    const reason = `[${msg.author.username}#${msg.author.discriminator}] ${args.join(' ') || 'No reason specified.'}`;

    guild.banMember(user, 0, reason);
    bot.createMessage(msg.channel.id, 'rekt');
  }
};
