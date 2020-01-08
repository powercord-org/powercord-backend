module.exports = {
  isAdmin: true,
  desc: 'Synchronizes roles.',
  func: async (bot, msg, cfg, mongo) => {
    const message = await bot.createMessage(msg.channel.id, 'Processing...');

    const { guild } = msg.channel;
    const users = await mongo.users.findAll();
    const filteredUsers = users.map(user => ({
      ...user,
      member: guild.members.find(member => member.id === user._id)
    })).filter(m => m.member);

    for (const user of filteredUsers) {
      const originalRoles = user.member.roles;
      let newRoles = [ ...user.member.roles ];

      if (!user.member.roles.includes(cfg.discord.boat.roles.user)) {
        newRoles.push(cfg.discord.boat.roles.user);
      }

      [ 'hunter', 'early', 'contributor' ].forEach(type => {
        if (cfg.discord.boat.roles[type] && user.badges[type] && !user.member.roles.includes(cfg.discord.boat.roles[type])) {
          newRoles.push(cfg.discord.boat.roles[type]);
        } else if (!user.badges[type] && user.member.roles.includes(cfg.discord.boat.roles[type])) {
          newRoles = newRoles.filter(r => r !== cfg.discord.boat.roles[type]);
        }
      });

      newRoles = [ ...new Set(newRoles) ];
      if (JSON.stringify(originalRoles.sort()) !== JSON.stringify(newRoles.sort())) {
        await guild.editMember(user._id, { roles: newRoles });
      }
    }

    message.edit('Done!');
  }
};
