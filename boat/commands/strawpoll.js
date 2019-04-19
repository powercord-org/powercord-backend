const emotes = {
  COUNCIL: '<a:neonblobcouncil:568848582325567508>',
  YES: ':tickYes:568848591313960960',
  NO: ':tickNo:568848616584642622'
};

module.exports = {
  isAdmin: true,
  func: async (bot, msg, config) => {
    const poll = msg.content.split(' ').slice(1).join(' ');

    const message = await bot.createMessage(config.discord.boat.strawpoll, `${emotes.COUNCIL} ${poll}`);
    await message.addReaction(emotes.YES);
    await message.addReaction(emotes.NO);
  }
};
