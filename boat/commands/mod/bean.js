module.exports = {
  desc: 'Beans a member.',
  permissions: [ 'banMembers' ],
  func: (bot, msg) => {
    const user = msg.mentions[0];
    if (user) {
      bot.createMessage(msg.channel.id, `Successfully beaned ${user.username}#${user.discriminator}`);
    }
  }
};
