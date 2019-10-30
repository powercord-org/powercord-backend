module.exports = async (bot, msg, tag, mongo) => {
  if (!await mongo.tags.findOne({ _id: tag })) {
    return bot.createMessage(msg.channel.id, 'This tag does not exist.');
  }

  await mongo.tags.deleteOne({ _id: tag });
  bot.createMessage(msg.channel.id, 'Tag deleted.');
};
