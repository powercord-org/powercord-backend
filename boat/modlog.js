const template = `
**$type | Case $case**

__User__: $user ($userid)
__Moderator__: $moderator ($modid)
__Reason__: $reason
`.trim();

module.exports = class Modlog {
  constructor (bot, config) {
    this.config = config;
    this.bot = bot;

    bot.on('guildBanAdd', this.processBanLog.bind(this, true));
    bot.on('guildBanRemove', this.processBanLog.bind(this, false));
    bot.on('guildMemberRemove', this.processLeaveLog.bind(this));
    bot.on('guildMemberUpdate', this.processMuteLog.bind(this));
  }

  async processBanLog (banned, guild, user) {
    const logs = await guild.getAuditLogs(5, null, banned ? 22 : 23);
    const entry = logs.entries.find(entry => entry.targetID = user.id);
    const [ modId, modName, reason ] = this._processAuditEntry(entry);
    const channel = this.bot.getChannel(this.config.discord.boat.modlog);
    const caseId = parseInt((await channel.getMessages(1))[0].content.match(/Case (\d)/)[1]) + 1;

    this.bot.createMessage(this.config.discord.boat.modlog, template
      .replace('$type', banned ? 'Ban' : 'Unban')
      .replace('$case', caseId)
      .replace('$user', `${user.username}#${user.discriminator}`)
      .replace('$userid', user.id)
      .replace('$moderator', modName)
      .replace('$modid', modId)
      .replace('$reason', reason)
    );
  }

  async processLeaveLog () {
    // Fetch audit log entries to check if it's a kick

    // getAuditLogs(limit, before, actionType)
  }

  async processMuteLog () {
    // Check if muted have been added/removed

    // Fetch audit logs
  }

  _processAuditEntry (entry) {
    let modId,
      modName,
      reason;
    if (entry.user.id === this.bot.user.id) {
      console.log(entry);
      const splittedReason = entry.reason.split(' ');
      modName = splittedReason.shift().replace('[', '').replace(']', '');
      reason = splittedReason.join(' ');
      const [ username, discrim ] = modName.split('#');
      modId = entry.guild.members.find(m => m.username === username && m.discriminator === discrim).id;
    } else {
      modId = entry.user.id;
      modName = `${entry.user.username}#${entry.user.discriminator}`;
      reason = entry.reason || '*No reason specified. Moderator, run pc/edit [case id] [reason]*';
    }
    return [ modId, modName, reason ];
  }
};
