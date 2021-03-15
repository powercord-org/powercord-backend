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

import type { GuildTextableChannel, Message } from 'eris'
import type { CivilLaw } from '../../laws.js'
import { mute, ban } from '../../mod.js'
import { getCivilLaws } from '../../laws.js'
import { isStaff, parseDuration, prettyPrintTimeSpan } from '../../util.js'
import config from '../../config.js'

const USAGE_STR = `Usage: ${config.discord.prefix}enforce <mention> <ruleId>`

export async function executor (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  if (!msg.member) return // ???
  if (!isStaff(msg.member)) {
    msg.channel.createMessage('no')
    return
  }

  if (args.length < 2) {
    msg.channel.createMessage(USAGE_STR)
    return
  }

  const target = args.shift()!.replace(/<@!?(\d+)>/, '$1')
  const ruleId = parseInt(args[0])
  const rules = getCivilLaws().get(ruleId)

  if (!rules) {
    msg.channel.createMessage(`This rule doesn't exist.\n${USAGE_STR}`)
    return
  }

  if (!rules.penalties) {
    msg.channel.createMessage(`This rule doesn't have actions tied to it.`)
    return
  }

  if (target === msg.author.id) {
    msg.channel.createMessage('I thought you don\'t break rules')
    return
  }

  if (isStaff(target, msg.channel.guild)) {
    msg.channel.createMessage('https://tenor.com/qCDY.gif')
    return
  }

  // todo: userID -> userId
  const cases = await msg._client.mongo.collection('enforce').countDocuments({ userID: target, rule: ruleId })
  if (!rules.penalties[cases]) {
    msg.channel.createMessage(`The maximum punishment has already been applied for rule #${ruleId}`)
    return
  }

  await punish(msg, target, rules.penalties[cases], rules, ruleId)
  msg._client.mongo.collection('enforce').insertOne({
    userID: target, // todo: userID -> userId
    rule: ruleId,
    mod: `${msg.author.username}#${msg.author.discriminator}` // todo: store id instead
  })
}

async function punish (msg: Message<GuildTextableChannel>, target: string, sentence: string, rule: CivilLaw, ruleId: number) { // punish me dadd- *ahem*
  const duration = (sentence.match(/^\d/) && parseDuration(sentence.split(' ')[0])) || void 0
  switch (true) {
    case sentence.includes('warning'):
      msg.channel.createMessage(`<@${target}>, you have broken rule #${ruleId}. This is a simple warning, but more serious actions will be taken next time.\n\n**Rule #${ruleId}**\n${rule.law}`)
      break
    case sentence.includes('mute') && !sentence.includes('ban'):
      mute(msg.channel.guild, target, msg.author, `Breaking rule #${ruleId}`, duration)
      msg.channel.createMessage(`<@${target}>, you have broken rule ${ruleId} and have been muted ${duration ? `for ${prettyPrintTimeSpan(duration)}` : ''}`)
      break
    case sentence.includes('ban') && !sentence.includes('mute'):
      ban(msg.channel.guild, target, msg.author, `Breaking rule #${ruleId}`, duration)
      msg.channel.createMessage({ content: `<@${target}> broke rule #${ruleId} and will not be able to see this message due to technical difficulties imposed by the practice of the yeeting, how unfortunate...`, allowedMentions: {} })
      break
    default:
      msg.channel.createMessage(`Unable to process \`${sentence}\`, please mod manually.`)
      break
  }
}
