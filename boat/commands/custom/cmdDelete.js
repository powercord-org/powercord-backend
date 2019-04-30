module.exports = {
  isAdmin: true,
  func: (bot, msg) => {
    bot.createMessage(msg.channel.id, 'soon');
  }
};
