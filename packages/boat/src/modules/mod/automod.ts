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
import { Period, getPeriod, ban, mute } from '../../mod.js'
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
const CLEANER = /[\u200B-\u200D\uFEFF]|[\u0300-\u036f]|[\u202A-\u202E]|[/\\]/g
const BAD_POWERCORD = /[Pp]ower[-_.,;:!*\s]*[C(]ord/
const EMOJI_UNICODE_RE = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]|(?:<a?:[^:]{2,}:\d{6,}>))/g
const EMOJI_RE = new RegExp(`${NAMES.map((n: string) => `:${n}:`).join('|').replace(/\+/g, '\\+')}|${EMOJI_UNICODE_RE.source}`, 'g')
const MAX_EMOJI_THRESHOLD_MULTIPLIER = 0.3 // Amount of words * mult (floored) = max amount of emojis allowed

// This list includes
// - Unicode variants of the latin letters (e.g mathematical)
// - Letters looking identical in other alphabets (e.g cyrillic)
// - Commonly-used variants of letters (e.g numbers)
// - Symbols looking like letters (e.g currencies)
// Some choices are opinionated. List is not perfect and in constant improvement:tm:
const NORMALIZE: [ RegExp, string ][] = [
  [ /А|Α|Ａ|@|＠|𝐀|𝑨|𝓐|𝕬|𝖠|𝗔|𝘈|𝘼|𝙰|𝐴|𝒜|𝔄|𝔸|\uD83C\uDDE6/g, 'A' ],
  [ /В|Β|Ｂ|𝐁|𝑩|𝓑|𝕭|𝖡|𝗕|𝘉|𝘽|𝙱|𝐵|𝔅|𝔹|\uD83C\uDDE7/g, 'B' ],
  [ /C|С|Ꮯ|Ｃ|𝐂|𝑪|𝓒|𝕮|𝖢|𝗖|𝘊|𝘾|𝙲|𝐶|𝒞|\uD83C\uDDE8/g, 'C' ],
  [ /Ｄ|𝐃|𝑫|𝓓|𝕯|𝖣|𝗗|𝘋|𝘿|𝙳|𝐷|𝒟|𝔇|𝔻|\uD83C\uDDE9/g, 'D' ],
  [ /Е|Ё|Ε|Ｅ|𝐄|𝑬|𝓔|𝕰|𝖤|𝗘|𝘌|𝙀|𝙴|𝐸|𝔈|𝔼|\uD83C\uDDEA/g, 'E' ],
  [ /Ｆ|𝐅|𝑭|𝓕|𝕱|𝖥|𝗙|𝘍|𝙁|𝙵|𝐹|𝔉|𝔽|\uD83C\uDDEB/g, 'F' ],
  [ /Ｇ|𝐆|𝑮|𝓖|𝕲|𝖦|𝗚|𝘎|𝙂|𝙶|𝐺|𝒢|𝔊|𝔾|\uD83C\uDDEC/g, 'G' ],
  [ /Н|Η|Ｈ|𝐇|𝑯|𝓗|𝕳|𝖧|𝗛|𝘏|𝙃|𝙷|𝐻|\uD83C\uDDED/g, 'H' ],
  [ /І|Ｉ|𝐈|𝑰|𝓘|𝕴|𝖨|𝗜|𝘐|𝙄|𝙸|𝐼|𝕀|\uD83C\uDDEE/g, 'I' ],
  [ /Ｊ|𝐉|𝑱|𝓙|𝕵|𝖩|𝗝|𝘑|𝙅|𝙹|𝐽|𝒥|𝔍|𝕁|\uD83C\uDDEF/g, 'J' ],
  [ /Κ|κ|Ｋ|𝐊|𝑲|𝓚|𝕶|𝖪|𝗞|𝘒|𝙆|𝙺|𝐾|𝒦|𝔎|𝕂|\uD83C\uDDF0/g, 'K' ],
  [ /Ｌ|𝐋|𝑳|𝓛|𝕷|𝖫|𝗟|𝘓|𝙇|𝙻|𝐿|𝔏|𝕃|￡|\uD83C\uDDF1/g, 'L' ],
  [ /М|Μ|Ｍ|𝐌|𝑴|𝓜|𝕸|𝖬|𝗠|𝘔|𝙈|𝙼|𝑀|𝔐|𝕄|\uD83C\uDDF2/g, 'M' ],
  [ /Ν|Ｎ|𝐍|𝑵|𝓝|𝕹|𝖭|𝗡|𝘕|𝙉|𝙽|𝑁|𝒩|𝔑|\uD83C\uDDF3/g, 'N' ],
  [ /О|Ø|Ο|Ｏ|𝐎|𝑶|𝓞|𝕺|𝖮|𝗢|𝘖|𝙊|𝙾|𝑂|𝒪|𝔒|𝕆|\uD83C\uDDF4/g, 'O' ],
  [ /Р|Ρ|Ｐ|𝐏|𝑷|𝓟|𝕻|𝖯|𝗣|𝘗|𝙋|𝙿|𝑃|𝒫|𝔓|\uD83C\uDDF5/g, 'P' ],
  [ /Ｑ|𝐐|𝑸|𝓠|𝕼|𝖰|𝗤|𝘘|𝙌|𝚀|𝑄|𝒬|𝔔|\uD83C\uDDF6/g, 'Q' ],
  [ /Ｒ|𝐑|𝑹|𝓡|𝕽|𝖱|𝗥|𝘙|𝙍|𝚁|𝑅|\uD83C\uDDF7/g, 'R' ],
  [ /Ѕ|Ｓ|𝐒|𝑺|𝓢|𝕾|𝖲|𝗦|𝘚|𝙎|𝚂|𝑆|𝒮|𝔖|𝕊|＄|\$|\uD83C\uDDF8/g, 'S' ],
  [ /Т|Τ|Ｔ|𝐓|𝑻|𝓣|𝕿|𝖳|𝗧|𝘛|𝙏|𝚃|𝑇|𝒯𝔗|𝕋|\uD83C\uDDF9/g, 'T' ],
  [ /Ｕ|𝐔|𝑼|𝓤|𝖀|𝖴|𝗨|𝘜|𝙐|𝚄|𝑈|𝒰|𝔘|𝕌|\uD83C\uDDFA/g, 'U' ],
  [ /Ѵ|Ｖ|𝐕|𝑽|𝓥|𝖁|𝖵|𝗩|𝘝|𝙑|𝚅|𝑉|𝒱|𝔙|𝕍|\uD83C\uDDFB/g, 'V' ],
  [ /Ｗ|𝐖|𝑾|𝓦|𝖂|𝖶|𝗪|𝘞|𝙒|𝚆|𝑊|𝒲|𝔚|𝕎|￦|\uD83C\uDDFC/g, 'W' ],
  [ /Х|Χ|Ｘ|𝐗|𝑿|𝓧|𝖃|𝖷|𝗫|𝘟|𝙓|𝚇|𝑋|𝒳|𝔛|𝕏|\uD83C\uDDFD/g, 'X' ],
  [ /Υ|Ｙ|𝐘|𝒀|𝓨|𝖄|𝖸|𝗬|𝘠|𝙔|𝚈|𝑌|𝒴|𝔜|𝕐|￥|\uD83C\uDDFE/g, 'Y' ],
  [ /Ζ|Ｚ|𝐙|𝒁|𝓩|𝖅|𝖹|𝗭|𝘡|𝙕|𝚉|𝑍|𝒵|\uD83C\uDDFF/g, 'Z' ],
  [ /а|α|ａ|𝐚|𝒂|𝓪|𝖆|𝖺|𝗮|𝘢|𝙖|𝚊|𝑎|𝒶|𝔞|𝕒|4|𝟒|𝟜|𝟦|𝟰|𝟺|４/g, 'a' ],
  [ /ｂ|𝐛|𝒃|𝓫|𝖇|𝖻|𝗯|𝘣|𝙗|𝚋|𝑏|𝒷|𝔟|𝕓/g, 'b' ],
  [ /с|ｃ|𝐜|𝒄|𝓬|𝖈|𝖼|𝗰|𝘤|𝙘|𝚌|𝑐|𝒸|𝔠|𝕔|©️|￠/g, 'c' ],
  [ /đ|ｄ|𝐝|𝒅|𝓭|𝖉|𝖽|𝗱|𝘥|𝙙|𝚍|𝑑|𝒹|𝔡|𝕕/g, 'd' ],
  [ /е|ё|3|ｅ|𝐞|𝒆|𝓮|𝖊|𝖾|𝗲|𝘦|𝙚|𝚎|𝑒|𝔢|𝕖|𝟑|𝟛|𝟥|𝟯|𝟹|３/g, 'e' ],
  [ /ｆ|𝐟|𝒇|𝓯|𝖋|𝖿|𝗳|𝘧|𝙛|𝚏|𝑓|𝒻|𝔣|𝕗/g, 'f' ],
  [ /9|ｇ|𝐠|𝒈|𝓰|𝖌|𝗀|𝗴|𝘨|𝙜|𝚐|𝑔|𝔤|𝕘|𝟗|𝟡|𝟫|𝟵|𝟿|９/g, 'g' ],
  [ /ｈ|𝐡|𝒉|𝓱|𝖍|𝗁|𝗵|𝘩|𝙝|𝚑|𝒽|𝔥|𝕙/g, 'h' ],
  [ /ı|і|ι|¡|1|ｉ|𝐢|𝒊|𝓲|𝖎|𝗂|𝗶|𝘪|𝙞|𝚒|𝑖|𝒾|𝔦|𝕚|𝟏|𝟙|𝟣|𝟭|𝟷|１/g, 'i' ],
  [ /ｊ|𝐣|𝒋|𝓳|𝖏|𝗃|𝗷|𝘫|𝙟|𝚓|𝑗|𝒿|𝔧|𝕛/g, 'j' ],
  [ /ｋ|𝐤|𝒌|𝓴|𝖐|𝗄|𝗸|𝘬|𝙠|𝚔|𝑘|𝓀|𝔨|𝕜/g, 'k' ],
  [ /ｌ|𝐥|𝒍|𝓵|𝖑|𝗅|𝗹|𝘭|𝙡|𝚕|𝑙|𝓁|𝔩|𝕝/g, 'l' ],
  [ /ｍ|𝐦|𝒎|𝓶|𝖒|𝗆|𝗺|𝘮|𝙢|𝚖|𝑚|𝓂|𝔪|𝕞/g, 'm' ],
  [ /ｎ|𝐧|𝒏|𝓷|𝖓|𝗇|𝗻|𝘯|𝙣|𝚗|𝑛|𝓃|𝔫|𝕟/g, 'n' ],
  [ /о|ø|0|ο|ｏ|𝐨|𝒐|𝓸|𝖔|𝗈|𝗼|𝘰|𝙤|𝚘|𝑜|𝔬|𝕠|𝟎|𝟘|𝟢|𝟬|𝟶|０/g, 'o' ],
  [ /р|ρ|ｐ|𝐩|𝒑|𝓹|𝖕|𝗉|𝗽|𝘱|𝙥|𝚙|𝑝|𝓅|𝔭|𝕡/g, 'p' ],
  [ /ｑ|𝐪|𝒒|𝓺|𝖖|𝗊|𝗾|𝘲|𝙦|𝚚|𝑞|𝓆|𝔮|𝕢/g, 'q' ],
  [ /ｒ|𝐫|𝒓|𝓻|𝖗|𝗋|𝗿|𝘳|𝙧|𝚛|𝑟|𝓇|𝔯|𝕣/g, 'r' ],
  [ /ѕ|ｓ|𝐬|𝒔|𝓼|𝖘|𝗌|𝘀|𝘴|𝙨|𝚜|𝑠|𝓈|𝔰|𝕤/g, 's' ],
  [ /ｔ|𝐭|𝒕|𝓽|𝖙|𝗍|𝘁|𝘵|𝙩|𝚝|𝑡|𝓉|𝔱|𝕥/g, 't' ],
  [ /υ|ｕ|𝐮|𝒖|𝓾|𝖚|𝗎|𝘂|𝘶|𝙪|𝚞|𝑢|𝓊|𝔲|𝕦/g, 'u' ],
  [ /ѵ|ν|ｖ|𝐯|𝒗|𝓿|𝖛|𝗏|𝘃|𝘷|𝙫|𝚟|𝑣|𝓋|𝔳|𝕧/g, 'v' ],
  [ /ｗ|𝐰|𝒘|𝔀|𝖜|𝗐|𝘄|𝘸|𝙬|𝚠|𝑤|𝓌|𝔴|𝕨/g, 'w' ],
  [ /х|ｘ|𝐱|𝒙|𝔁|𝖝|𝗑|𝘅|𝘹|𝙭|𝚡|𝑥|𝓍|𝔵|𝕩/g, 'x' ],
  [ /У|у|γ|ｙ|𝐲|𝒚|𝔂|𝖞|𝗒|𝘆|𝘺|𝙮|𝚢|𝑦|𝓎|𝔶|𝕪/g, 'y' ],
  [ /ｚ|𝐳|𝒛|𝔃|𝖟|𝗓|𝘇|𝘻|𝙯|𝚣|𝑧|𝓏|𝔷|𝕫/g, 'z' ],
]

export const BLACKLIST_CACHE: string[] = []

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
  let normalizedMessage = msg.content.normalize('NFD')
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

  // Filter bad words
  if (!BLACKLIST_CACHE.length) {
    const b = await this.mongo.collection('blacklist').find().toArray()
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
