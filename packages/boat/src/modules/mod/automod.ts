/*
 * Copyright (c) 2018-2021 aetheryx & Cynthia K. Rey
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { CommandClient, Message, GuildTextableChannel, Guild, Invite } from 'eris'
import { URL } from 'url'
import { readFileSync } from 'fs'
import { deleteMeta } from './logger.js'
import { skipSnipe } from '../sniper.js'
import { Period, getPeriod, ban, mute, softBan } from '../../mod.js'
import { isStaff } from '../../util.js'
import config from '../../config.js'

const NAMES = JSON.parse(readFileSync(new URL('../../../twemojiNames.json', import.meta.url), 'utf8'))
const INVITE_RE_SRC = '(?:https?:\\/\\/)?(?:www\\.)?(discord\\.(?:gg|io|me|li|link|list|media)|(?:discord(?:app)?|watchanimeattheoffice)\\.com\\/invite)\\/(.+[a-zA-Z0-9])'
const INVITE_RE_G = new RegExp(INVITE_RE_SRC, 'ig')
const INVITE_RE = new RegExp(INVITE_RE_SRC, 'i')
const INVITE_CHECK_FOR = [
  'discord.gg',
  'discord.media',
  'discord.com/invite',
  'discordapp.com/invite',
  'watchanimeattheoffice.com/invite',
]

// todo: spaces
const CLEANER = /[\u200B-\u200F\u2060-\u2063\uFEFF\u00AD\u180E]|[\u0300-\u036f]|[\u202A-\u202E]|[/\\]/g
const BAD_POWERCORD = /[Pp]ower[-_.,;:!*\s+]*[C(]ord/
const EMOJI_UNICODE_RE = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]|(?:<a?:[^:]{2,}:\d{6,}>))/g
const EMOJI_RE = new RegExp(`${NAMES.map((n: string) => `:${n}:`).join('|').replace(/\+/g, '\\+')}|${EMOJI_UNICODE_RE.source}`, 'g')
const MAX_EMOJI_THRESHOLD_MULTIPLIER = 0.3 // Amount of words * mult (floored) = max amount of emojis allowed

// todo: a "better" normalization with multi-pass, so things like numbers don't get replaced pass-1
const NORMALIZE: [ RegExp, string ][] = [
  [ /Α|А|₳|Ꭿ|Ꭺ|Λ|@|🅰|🅐|\uD83C\uDDE6/g, 'A' ],
  [ /Β|В|в|฿|₿|Ᏸ|Ᏼ|🅱|🅑|\uD83C\uDDE7/g, 'B' ],
  [ /С|Ⅽ|₡|₵|Ꮳ|Ꮯ|Ꮸ|ᑕ|🅲|🅒|\uD83C\uDDE8/g, 'C' ],
  [ /Ⅾ|ↁ|ↇ|Ꭰ|🅳|🅓|\uD83C\uDDE9/g, 'D' ],
  [ /Ε|Ξ|ξ|Е|Ꭼ|Ꮛ|℮|🅴|🅔|\uD83C\uDDEA/g, 'E' ],
  [ /Ғ|ғ|₣|🅵|🅕|\uD83C\uDDEB/g, 'F' ],
  [ /₲|Ꮆ|Ᏻ|Ᏽ|🅶|🅖|\uD83C\uDDEC/g, 'G' ],
  [ /Η|Н|н|Ӊ|ӊ|Ң|ң|Ӈ|ӈ|Ҥ|ҥ|Ꮋ|🅷|🅗|\uD83C\uDDED/g, 'H' ],
  [ /Ι|І|Ӏ|ӏ|Ⅰ|Ꮖ|Ꮠ|🅸|🅘|\uD83C\uDDEE/g, 'I' ],
  [ /Ј|Ꭻ|🅹|🅙|\uD83C\uDDEF/g, 'J' ],
  [ /Κ|κ|К|к|Қ|қ|Ҟ|ҟ|Ҡ|ҡ|Ӄ|ӄ|Ҝ|ҝ|₭|Ꮶ|🅺|🅚|\uD83C\uDDF0/g, 'K' ],
  [ /Ⅼ|£|Ł|Ꮮ|🅻|🅛|\uD83C\uDDF1/g, 'L' ],
  [ /Μ|М|м|Ӎ|ӎ|Ⅿ|Ꮇ|🅼|🅜|\uD83C\uDDF2/g, 'M' ],
  [ /Ν|И|и|Ҋ|ҋ|₦|🅽|🅝|\uD83C\uDDF3/g, 'N' ],
  [ /Θ|θ|Ο|О|Ө|Ø|Ꮎ|Ꮻ|Ꭴ|Ꮕ|🅾|🅞|\uD83C\uDDF4/g, 'O' ],
  [ /Ρ|Р|Ҏ|₽|₱|Ꭾ|Ꮅ|Ꮲ|🅿|🆊|🅟|\uD83C\uDDF5/g, 'P' ],
  [ /🆀|🅠|\uD83C\uDDF6/g, 'Q' ],
  [ /Я|я|Ꭱ|Ꮢ|🆁|🅡|\uD83C\uDDF7/g, 'R' ],
  [ /Ѕ|\$|Ꭶ|Ꮥ|Ꮪ|🆂|🅢|\uD83C\uDDF8/g, 'S' ],
  [ /Τ|Т|т|Ҭ|ҭ|₮|₸|Ꭲ|🆃|🅣|\uD83C\uDDF9/g, 'T' ],
  [ /🆄|🅤|\uD83C\uDDFA/g, 'U' ],
  [ /Ⅴ|Ꮴ|Ꮙ|Ꮩ|🆅|🅥|\uD83C\uDDFB/g, 'V' ],
  [ /₩|Ꮃ|Ꮤ|🆆|🅦|\uD83C\uDDFC/g, 'W' ],
  [ /Χ|χ|Х|Ҳ|🆇|🅧|\uD83C\uDDFD/g, 'X' ],
  [ /Υ|У|Ү|Ұ|¥|🆈|🅨|\uD83C\uDDFE/g, 'Y' ],
  [ /Ζ|Ꮓ|🆉|🅩|\uD83C\uDDFF/g, 'Z' ],
  [ /α|а/g, 'a' ],
  [ /β|Ꮟ/g, 'b' ],
  [ /ϲ|с|ⅽ|↻|¢|©️/g, 'c' ],
  [ /đ|ⅾ|₫|Ꮷ|ժ|🆥/g, 'd' ],
  [ /ε|е|Ҽ|ҽ|Ҿ|ҿ|Є|є|€/g, 'e' ],
  [ /ƒ/g, 'f' ],
  // [ //g, 'g' ],
  [ /Ћ|ћ|Һ|һ|Ꮒ|Ꮵ/g, 'h' ],
  [ /ι|і|ⅰ|Ꭵ|¡/g, 'i' ],
  [ /ј/g, 'j' ],
  // [ /|/g, 'k' ],
  [ /ⅼ|£|₤/g, 'l' ],
  [ /ⅿ|₥/g, 'm' ],
  // [ /|/g, 'n' ],
  [ /ο|о|օ|ө|ø|¤|๏/g, 'o' ],
  [ /ρ|р|ҏ|Ꮘ|φ|ק/g, 'p' ],
  // [ /|/g, 'q' ],
  [ /ɾ/g, 'r' ],
  [ /ѕ/g, 's' ],
  [ /τ/g, 't' ],
  [ /μ|υ/g, 'u' ],
  [ /ν|ⅴ/g, 'v' ],
  [ /ω|ա|山/g, 'w' ],
  [ /х|ҳ|ⅹ/g, 'x' ],
  [ /γ|у|ү|ұ|Ꭹ|Ꮍ/g, 'y' ],
  // [ /|/g, 'z' ],
  [ /⓿/g, '0' ],
  [ /⓵/g, '1' ],
  [ /⓶/g, '2' ],
  [ /⓷/g, '3' ],
  [ /Ꮞ|⓸/g, '4' ],
  [ /⓹/g, '5' ],
  [ /⓺/g, '6' ],
  [ /⓻/g, '7' ],
  [ /⓼/g, '8' ],
  [ /⓽/g, '9' ],
  [ /⓾/g, '10' ],
  [ /⓫/g, '11' ],
  [ /⓬/g, '12' ],
  [ /⓭/g, '13' ],
  [ /⓮/g, '14' ],
  [ /⓯/g, '15' ],
  [ /⓰/g, '16' ],
  [ /⓱/g, '17' ],
  [ /⓲/g, '18' ],
  [ /⓳/g, '19' ],
  [ /⓴/g, '20' ],
  [ /1/g, 'i' ],
  [ /3/g, 'e' ],
  [ /4/g, 'a' ],
  [ /9/g, 'g' ],
  [ /0/g, 'o' ],
]

export const BLACKLIST_CACHE: string[] = []
const SPAM_HINTS = [ 'discord', 'nitro', 'steam', 'cs:go', 'csgo' ]

const correctedPeople = new Map<string, number>()

function takeAction (msg: Message, reason: string, warning: string, attemptedBypass: boolean, loose?: boolean) {
  skipSnipe.add(msg.id)
  deleteMeta.set(msg.id, reason)
  msg.delete(reason)

  if (!msg.member) return // ??
  const period = getPeriod(msg.member)
  if (!loose && period === Period.PROBATIONARY) {
    ban(msg.member.guild, msg.author.id, null, `Automod: ${reason} (New member)`)
    return
  }

  if (period === Period.RECENT) {
    if (attemptedBypass) {
      ban(msg.member.guild, msg.author.id, null, `Automod: ${reason} (Recent member, attempted bypass)`)
      return
    }

    mute(msg.member.guild, msg.author.id, null, `Automod: ${reason} (Recent member)`, 24 * 3600e3)
  }

  if (period === Period.KNOWN && attemptedBypass) {
    mute(msg.member.guild, msg.author.id, null, `Automod: ${reason} (Attempted bypass)`, 12 * 3600e3)
  }

  msg.channel.createMessage({ content: warning, allowedMentions: { users: [ msg.author.id ] } })
    .then((m) => setTimeout(() => m.delete(), 10e3))
}

async function processMessage (this: CommandClient, msg: Message<GuildTextableChannel>) {
  if (msg.guildID !== config.discord.ids.serverId || msg.author.bot || isStaff(msg.member)) return null
  let normalizedMessage = msg.content.normalize('NFKD')
  let attemptedBypass = false
  for (const [ re, rep ] of NORMALIZE) {
    const cleanerString = normalizedMessage.replace(re, rep)
    attemptedBypass = attemptedBypass || normalizedMessage !== cleanerString
    normalizedMessage = cleanerString
  }

  const cleanNormalizedMessage = normalizedMessage.replace(CLEANER, '')
  const cleanMessage = msg.content.replace(CLEANER, '')

  const lowercaseMessage = msg.content.toLowerCase()
  const cleanLowercaseMessage = cleanMessage.toLowerCase()
  const cleanNormalizedLowercaseMessage = cleanNormalizedMessage.toLowerCase()

  // Filter scams
  if (
    msg.content.includes('@everyone')
    && (msg.content.includes('https://') || msg.content.includes('http://'))
    && SPAM_HINTS.find((h) => cleanNormalizedLowercaseMessage.includes(h))
  ) {
    softBan(msg.channel.guild, msg.author.id, null, 'Automod: Detected scambot', 1)
    return
  }

  // Filter bad words
  if (!BLACKLIST_CACHE.length) {
    const b = await this.mongo.collection('boat-blacklist').find().toArray()
    BLACKLIST_CACHE.push(...b.map((e) => e.word))
  }

  for (const word of BLACKLIST_CACHE) {
    const simpleContains = lowercaseMessage.includes(word)
    if (simpleContains || cleanLowercaseMessage.includes(word) || cleanNormalizedLowercaseMessage.includes(word)) {
      takeAction(
        msg,
        'Message contained a blacklisted word',
        `${msg.author.mention} Your message has been deleted because it contained a word blacklisted.`,
        !simpleContains
      )
    }
  }

  // Filter ads
  const invites = msg.content.match(INVITE_RE_G)
  if (invites) {
    for (const invite of invites) {
      const [ , url, code ] = invite.match(INVITE_RE)!
      if (INVITE_CHECK_FOR.includes(url)) {
        const inv = await this.getInvite(code)
        if (inv && inv.guild?.id === config.discord.ids.serverId) continue
      }

      takeAction(
        msg,
        'Advertisement',
        `${msg.author.mention} **Rule #02**: Advertising of any kind is prohibited.`,
        false
      )
      return // No need to keep checking for smth else
    }
  }

  // Filter emoji spam
  const emojis = msg.content.match(EMOJI_RE)?.length || 0
  if (emojis > 5) {
    const words = msg.content.replace(EMOJI_RE, '').split(/\s+/g).filter(Boolean).length
    const max = Math.floor(words * MAX_EMOJI_THRESHOLD_MULTIPLIER)
    if (emojis > max) {
      takeAction(
        msg,
        'Emoji spam',
        `${msg.author.mention} **Rule #03**: Spam of any kind is prohibited.\nConsider reducing the amount of emojis in your message.`,
        false,
        true
      )
      return // No need to keep checking for smth else
    }
  }

  // Deal with people who can't write
  if (BAD_POWERCORD.test(cleanNormalizedMessage)) {
    skipSnipe.add(msg.id)
    deleteMeta.set(msg.id, 'Improper writing of Powercord')
    msg.delete('Improper writing of Powercord')
    if (msg.channel.id === config.discord.ids.channelMuted) return

    const count = (correctedPeople.get(msg.author.id) || 0) + 1
    if (count === 3) {
      msg.channel.createMessage({ content: 'I said: **There is no uppercase C**. "Powercord".', allowedMentions: {} })
      mute(msg.channel.guild, msg.author.id, null, 'Can\'t spell "Powercord" (3rd time)', 300e3)
      correctedPeople.set(msg.author.id, 0)
    } else {
      msg.channel.createMessage({
        content: count === 2
          ? 'There is no uppercase C. "Powercord". You shouldn\'t try again.'
          : 'There is no uppercase C. "Powercord".',
        allowedMentions: {},
      })
      correctedPeople.set(msg.author.id, count)
    }
  }
}

function checkInvite (guild: Guild, invite: Invite) {
  const member = invite.inviter && guild.members.get(invite.inviter.id)
  console.log(member?.username)
  if (!member) return

  const channel = guild.channels.get(invite.channel.id)
  console.log(channel?.name)
  if (!channel) return

  if (!channel.permissionsOf(member).has('readMessages')) {
    invite.delete('Honeypot: no permissions to see channel but created an invite')

    // todo: ban instead of logging
    const staff = guild.channels.get(config.discord.ids.channelStaff) as GuildTextableChannel | undefined
    staff?.createMessage({ content: `:eyes: ${invite.code} <@${member.id}> ${member.username}#${member.discriminator} <#${invite.channel.id}>`, allowedMentions: {} })
  }

  // todo: check if user is muted, flag invite as suspicious
}

export default function (bot: CommandClient) {
  bot.on('messageCreate', processMessage)
  bot.on('messageUpdate', processMessage)
  bot.on('inviteCreate', checkInvite)
}
