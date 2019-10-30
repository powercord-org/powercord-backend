module.exports = async (bot, msg, tag, content, mongo) => {
  if (await mongo.tags.findOne({ _id: tag })) {
    return bot.createMessage(msg.channel.id, 'This tag already exists.');
  }

  await mongo.tags.insertOne({
    _id: tag,
    content
  });
  bot.createMessage(msg.channel.id, 'Tag created.');
};
