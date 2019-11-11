const { Constants: { AuditLogActions } } = require('eris');
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

  processBanLog (banned, guild, user) {
    setTimeout(async () => {
      const logs = await guild.getAuditLogs(5, null, banned ? AuditLogActions.MEMBER_BAN_ADD : AuditLogActions.MEMBER_BAN_REMOVE);
      const entry = logs.entries.find(entry => entry.targetID = user.id);
      const [ modId, modName, reason ] = this._processAuditEntry(entry);
      const channel = this.bot.getChannel(this.config.discord.boat.modlog);
      const caseId = parseInt((await channel.getMessages(1))[0].content.match(/Case (\d)/)[1]) + 1;

      this.bot.createMessage(this.config.discord.boat.modlog, template
        .replace('$type', banned ? '<a:crabrave:590881356926418966> Ban' : 'Unban')
        .replace('$case', caseId)
        .replace('$user', `${user.username}#${user.discriminator}`)
        .replace('$userid', user.id)
        .replace('$moderator', modName)
        .replace('$modid', modId)
        .replace('$reason', reason)
      );
    }, 1500); // Ensure audit log entry is there
  }

  processLeaveLog (guild, user) {
    setTimeout(async () => {
      const logs = await guild.getAuditLogs(5, null, AuditLogActions.MEMBER_KICK);
      const entry = logs.entries.find(entry => entry.targetID = user.id);
      if (entry && Date.now() - Number((BigInt(entry.id) >> BigInt('22')) + BigInt('1420070400000')) < 5000) {
        const [ modId, modName, reason ] = this._processAuditEntry(entry);
        const channel = this.bot.getChannel(this.config.discord.boat.modlog);
        const caseId = parseInt((await channel.getMessages(1))[0].content.match(/Case (\d+)/)[1]) + 1;

        this.bot.createMessage(this.config.discord.boat.modlog, template
          .replace('$type', '<:yeet:640214692979015680> Kick')
          .replace('$case', caseId)
          .replace('$user', `${user.username}#${user.discriminator}`)
          .replace('$userid', user.id)
          .replace('$moderator', modName)
          .replace('$modid', modId)
          .replace('$reason', reason)
        );
      }
    }, 1500); // Ensure audit log entry is there
  }

  processMuteLog (guild, user) {
    setTimeout(async () => {
      const logs = await guild.getAuditLogs(5, null, AuditLogActions.MEMBER_ROLE_UPDATE);
      const entry = logs.entries.find(entry => entry.targetID = user.id);
      if (entry && Date.now() - Number((BigInt(entry.id) >> BigInt('22')) + BigInt('1420070400000')) < 5000) {
        if (entry.after.$add && entry.after.$add.find(r => r.id === this.config.discord.boat.roles.mute)) {
          this._logMute(entry, user, true);
        } else if (entry.after.$remove && entry.after.$remove.find(r => r.id === this.config.discord.boat.roles.mute)) {
          this._logMute(entry, user, false);
        }
      }
    }, 1500); // Ensure audit log entry is there
  }

  async _logMute (entry, user, muted) {
    const [ modId, modName, reason ] = this._processAuditEntry(entry);
    const channel = this.bot.getChannel(this.config.discord.boat.modlog);
    const caseId = parseInt((await channel.getMessages(1))[0].content.match(/Case (\d+)/)[1]) + 1;

    this.bot.createMessage(this.config.discord.boat.modlog, template
      .replace('$type', muted ? '🤫 Mute' : 'Unmute')
      .replace('$case', caseId)
      .replace('$user', `${user.username}#${user.discriminator}`)
      .replace('$userid', user.id)
      .replace('$moderator', modName)
      .replace('$modid', modId)
      .replace('$reason', reason)
    );
  }

  _processAuditEntry (entry) {
    let modId,
      modName,
      reason;
    if (entry.user.id === this.bot.user.id) {
      const splittedReason = entry.reason.split(' ');
      modName = splittedReason.shift().replace('[', '').replace(']', '');
      reason = splittedReason.join(' ');
      const [ username, discrim ] = modName.split('#');
      modId = entry.guild.members.find(m => m.username === username && m.discriminator === discrim).id;
    } else {
      modId = entry.user.id;
      modName = `${entry.user.username}#${entry.user.discriminator}`;
      reason = entry.reason || 'No reason specified.';
    }
    return [ modId, modName, reason ];
  }
};
