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
      const originalRoles = user.member.roles;
      let newRoles = [ ...user.member.roles ];

      if (!user.member.roles.includes(cfg.discord.boat.roles.user)) {
        newRoles.push(cfg.discord.boat.roles.user);
      }

      if (user.metadata.tester && !user.member.roles.includes(cfg.discord.boat.roles.tester)) {
        newRoles.push(cfg.discord.boat.roles.tester);
      } else if (!user.metadata.tester && user.member.roles.includes(cfg.discord.boat.roles.tester)) {
        newRoles = newRoles.filter(r => r !== cfg.discord.boat.roles.tester);
      }

      if (user.metadata.hunter && !user.member.roles.includes(cfg.discord.boat.roles.hunter)) {
        newRoles.push(cfg.discord.boat.roles.hunter);
      } else if (!user.metadata.hunter && user.member.roles.includes(cfg.discord.boat.roles.hunter)) {
        newRoles = newRoles.filter(r => r !== cfg.discord.boat.roles.hunter);
      }

      if (user.metadata.early && !user.member.roles.includes(cfg.discord.boat.roles.early)) {
        newRoles.push(cfg.discord.boat.roles.early);
      } else if (!user.metadata.early && user.member.roles.includes(cfg.discord.boat.roles.early)) {
        newRoles = newRoles.filter(r => r !== cfg.discord.boat.roles.early);
      }

      if (user.metadata.contributor && !user.member.roles.includes(cfg.discord.boat.roles.contributor)) {
        newRoles.push(cfg.discord.boat.roles.contributor);
      } else if (!user.metadata.contributor && user.member.roles.includes(cfg.discord.boat.roles.contributor)) {
        newRoles = newRoles.filter(r => r !== cfg.discord.boat.roles.contributor);
      }

      newRoles = [ ...new Set(newRoles) ];
      if (JSON.stringify(originalRoles.sort()) !== JSON.stringify(newRoles.sort())) {
        await guild.editMember(user.id, { roles: newRoles });
      }
    }

    message.edit('Done!');
  }
};
