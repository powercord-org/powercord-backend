import type { GuildTextableChannel, Message } from 'eris'
import { ban } from '../../mod.js'
import { parseDuration } from '../../util.js'
import config from '../../config.js'

const USAGE_STR = `Usage: ${config.discord.prefix}ban <mention || id> [reason]|[duration]`

export function executor (msg: Message<GuildTextableChannel>, args: string[]): void {
  if (!msg.member) return // ???
  if (!msg.member.permissions.has('manageMessages')) {
    msg.channel.createMessage('no')
    return
  }

  if (args.length === 0) {
    msg.channel.createMessage(USAGE_STR)
    return
  }

  const target = args.shift()!.replace(/<@!?(\d+)>/, '$1')
  const reason = args.join(' ').split('|')[0] || void 0
  const rawDuration = msg.content.includes('|') ? msg.content.split('|')[1].trim().toLowerCase().match(/\d+(m|h|d)/) : null

  if (target === msg.author.id) {
    msg.channel.createMessage('Don\'t do that to yourself')
    return
  }

  let duration
  if (rawDuration) {
    duration = parseDuration(rawDuration[0])
    if (!duration) {
      msg.channel.createMessage('Invalid duration')
      return
    }
  }

  ban(msg.channel.guild, target, msg.author, reason, duration)
  msg.channel.createMessage('Ultra-yeeted')
  return
}
