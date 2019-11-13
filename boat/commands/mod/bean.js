module.exports = {
  desc: 'Beans a member.',
  permissions: [ 'banMembers' ],
  func: (bot, msg) => {
    const user = msg.mentions[0];
    if (user) {
      if (user.id === msg.author.id) {
        return bot.createMessage(msg.channel.id, ';;');
      }
      bot.createMessage(msg.channel.id, `Successfully beaned ${user.username}#${user.discriminator}`);
    }
  }
};
