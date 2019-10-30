module.exports = async (bot, msg, tag, content, mongo) => {
  if (!await mongo.tags.findOne({ _id: tag })) {
    return bot.createMessage(msg.channel.id, 'This tag does not exist.');
  }

  await mongo.tags.updateOne({ _id: tag }, { $set: { content } });
  bot.createMessage(msg.channel.id, 'Tag updated.');
};
