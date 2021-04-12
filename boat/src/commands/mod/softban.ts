import type { GuildTextableChannel, Message } from 'eris'
import { softBan } from '../../mod.js'
import { isStaff } from '../../util.js'
import config from '../../config.js'

const USAGE_STR = `Usage: ${config.discord.prefix}softban <mention || id> [reason]`

export function executor (msg: Message<GuildTextableChannel>, args: string[]): void {
  if (!msg.member) return // ???
  if (!isStaff(msg.member)) {
    msg.channel.createMessage('no')
    return
  }

  if (args.length === 0) {
    msg.channel.createMessage(USAGE_STR)
    return
  }

  const target = args.shift()!.replace(/<@!?(\d+)>/, '$1')
  const reason = args.join(' ').split('|')[0] || void 0

  if (target === msg.author.id) {
    msg.channel.createMessage('Don\'t do that to yourself')
    return
  }

  if (isStaff(target, msg.channel.guild)) {
    msg.channel.createMessage('Maybe you two should talk this one out')
    return
  }

  softBan(msg.channel.guild, target, msg.author, reason, 1)
  msg.channel.createMessage('yeeted')
  return
}
