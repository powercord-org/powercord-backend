module.exports = {
  isAdmin: true,
  func: async (bot, msg, cfg, mongo) => {
    const message = await bot.createMessage(msg.channel.id, 'Processing...');

    const guild = bot.guilds.find(g => g.id === '538759280057122817');
    const users = await mongo.users.find().toArray();
    const filteredUsers = users.map(user => ({
      ...user,
      member: guild.members.find(member => member.id === user.id)
    })).filter(m => m.member);

    for (const user of filteredUsers) {
      if (!user.member.roles.includes(cfg.discord.boat.roles.user)) {
        await guild.addMemberRole(user.id, cfg.discord.boat.roles.user);
      }

      if (user.metadata.tester && !user.member.roles.includes(cfg.discord.boat.roles.tester)) {
        await guild.addMemberRole(user.id, cfg.discord.boat.roles.tester);
      } else if (!user.metadata.tester && user.member.roles.includes(cfg.discord.boat.roles.tester)) {
        await guild.removeMemberRole(user.id, cfg.discord.boat.roles.tester);
      }

      if (user.metadata.hunter && !user.member.roles.includes(cfg.discord.boat.roles.hunter)) {
        await guild.addMemberRole(user.id, cfg.discord.boat.roles.hunter);
      } else if (!user.metadata.hunter && user.member.roles.includes(cfg.discord.boat.roles.hunter)) {
        await guild.removeMemberRole(user.id, cfg.discord.boat.roles.hunter);
      }

      if (user.metadata.early && !user.member.roles.includes(cfg.discord.boat.roles.early)) {
        await guild.addMemberRole(user.id, cfg.discord.boat.roles.early);
      } else if (!user.metadata.early && user.member.roles.includes(cfg.discord.boat.roles.early)) {
        await guild.removeMemberRole(user.id, cfg.discord.boat.roles.early);
      }

      if (user.metadata.contributor && !user.member.roles.includes(cfg.discord.boat.roles.contributor)) {
        await guild.addMemberRole(user.id, cfg.discord.boat.roles.contributor);
      } else if (!user.metadata.contributor && user.member.roles.includes(cfg.discord.boat.roles.contributor)) {
        await guild.removeMemberRole(user.id, cfg.discord.boat.roles.contributor);
      }
    }

    message.edit('Done!');
  }
};
