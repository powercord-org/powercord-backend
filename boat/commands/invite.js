module.exports = {
  desc: 'Link to invite the bot.',
  func: (bot, msg) => {
    bot.createMessage(msg.channel.id, '<:peepoGnome:563129237398224916>');
  }
};
