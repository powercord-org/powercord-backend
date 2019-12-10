module.exports = async (bot, msg, mongo) => {
  const tags = await mongo.tags.find({}).toArray();
  bot.createMessage(msg.channel.id, `Available tags: ${tags.map(t => t._id).join(', ')}`);
};
