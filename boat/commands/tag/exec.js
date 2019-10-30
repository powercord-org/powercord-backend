module.exports = async (bot, msg, tag, mongo) => {
  const tagEntry = await mongo.tags.findOne({ _id: tag });
  if (!tagEntry) {
    return bot.createMessage(msg.channel.id, 'This tag does not exist.');
  }
  bot.createMessage(msg.channel.id, tagEntry.content);
};
