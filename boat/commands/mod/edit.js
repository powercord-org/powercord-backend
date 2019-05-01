module.exports = {
  permissions: [ 'manageMessages' ], // in fact permission checking is not really required, but shrug
  func: async (bot, msg, config) => {
    const args = msg.content.split(' ');
    args.shift(); // drop command prefix
    const caseId = args.shift();

    const channel = bot.getChannel(config.discord.boat.modlog);
    const messages = await channel.getMessages(100);
    const message = messages.find(m => m.content.includes(`Case ${caseId}`));
    if (!message) {
      return bot.createMessage(msg.channel.id, 'This case doesn\'t exist or is too old');
    }

    const modId = message.content.match(/\n__Moderator(?:[^(]+)\((\d+)/)[1];
    if (modId !== msg.author.id && !config.admins.includes(msg.author.id)) {
      return bot.createMessage(msg.channel.id, 'You\'re not the responsible moderator');
    }

    const content = message.content.match(/([^]+)\n__Reason__/)[1];
    let newReason = args.join(' ');
    if (modId !== msg.author.id) {
      newReason += ` *(edited by ${msg.author.username}#${msg.author.discriminator})*`;
    }

    await message.edit(`${content}\n__Reason__: ${newReason}`);
    bot.createMessage(msg.channel.id, 'ok');
  }
};
