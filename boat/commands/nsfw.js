module.exports = {
  desc: 'Toggles the "no nsfw" role',
  func: async (bot, msg, config) => {
    if (!msg.member.roles.includes(config.discord.boat.roles.nsfw)) {
      msg.member.addRole(config.discord.boat.roles.nsfw, 'pc/nsfw command');
      bot.createMessage(msg.channel.id, 'Role `no nsfw` granted, you should no longer have access to NSFW channels.');
    } else {
      msg.member.removeRole(config.discord.boat.roles.nsfw, 'pc/nsfw command');
      bot.createMessage(msg.channel.id, 'Role `no nsfw` revoked, you should now have access to NSFW channels.');
    }
  }
};
