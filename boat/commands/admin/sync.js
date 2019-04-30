module.exports = {
  isAdmin: true,
  func: async (bot, msg, cfg, mongo) => {
    // reminder that if this code is in production then bow zr is gay
    const message = await bot.createMessage(msg.channel.id, 'Processing...');

    const { guild } = msg.channel;
    const mongoUsers = await mongo.users.find().toArray();
    const filteredMembers = [];
    guild.members.forEach(member => {
      let mongoUser = mongoUsers.find(user => user.id == member.id);
      if (mongoUser) {
        member.mongoUser = mongoUser;
        filteredMembers.push(mongoUser);
      }
    });

    await Promise.all(filteredMembers.map(member => {
      const originalRoles = member.roles;
      let newRoles = [ ...member.roles ];

      if (!member.roles.includes(cfg.discord.boat.roles.user)) {
        newRoles.push(cfg.discord.boat.roles.user);
      }

      ["tester", "hunter", "early", "contributor"].forEach(key => {
        if (member.mongoUser.metadata.tester && !member.roles.includes(cfg.discord.boat.roles.tester)) {
          newRoles.push(cfg.discord.boat.roles.tester);
        } else if (!member.mongoUser.metadata.tester && member.roles.includes(cfg.discord.boat.roles.tester)) {
          newRoles = newRoles.filter(r => r !== cfg.discord.boat.roles.tester);
        }
      });

      newRoles = [ ...new Set(newRoles) ];
      if (JSON.stringify(originalRoles.sort()) !== JSON.stringify(newRoles.sort())) {
        return guild.editMember(member.id, { roles: newRoles });
      }
    }));

    message.edit('Done!');
  }
};
