/*
* Copyright (c) 2018-2020 aetheryx & Bowser65
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

const config = require('../../../config.json')
const task = require('../../tasks')
const { parseRule, parseDuration } = require('../../utils')

const USAGE_STR = `Usage: ${config.discord.prefix}enforce [mention] [ruleID]`

module.exports = async function (msg, args) {
  if (!msg.member.permission.has('manageMessages')) {
    return msg.channel.createMessage('no')
  }

  if (args.length < 2) {
    return msg.channel.createMessage(USAGE_STR)
  }

  const target = args.shift().replace(/<@!?(\d+)>/, '$1')
  const ruleID = parseInt(args[0])
  const rawRule = await parseRule(ruleID, msg)

  if (rawRule === null) {
    return msg.channel.createMessage(`This rule doesn't exist.\n${USAGE_STR}`)
  }

  if (target === msg.author.id) {
    return msg.channel.createMessage('I thought you don\'t break rules')
  }

  const actions = rawRule.split('Actions:')[1].trim().split(' -> ')
  const cases = await msg._client.mongo.collection('enforce').find({ userID: target, rule: ruleID }).toArray()

  if (actions[cases.length]) {
    punish(msg, target, actions[cases.length], ruleID)
  } else {
    return msg.channel.createMessage(`The mamixmum punishment has already been applied for rule ${ruleID}`)
  }

  msg._client.mongo.collection('enforce').insertOne({
    userID: target,
    rule: ruleID,
    mod: `${msg.author.username}#${msg.author.discriminator}`
  })
}

async function punish (msg, target, sentence, rule) {
  const entry = task.EMPTY_TASK_OBJ
  let reply; let type; const mod = `${msg.author.username}#${msg.author.discriminator}`

  const duration = sentence.match(/\d+(m|h|d)/) ? sentence.match(/\d+(m|h|d)/)[0] : null
  const time = duration ? Date.now() + parseDuration(duration) : null

  if (sentence.includes('warning')) {
    type = 'warning'
    reply = `<@${target}>, you have broken rule ${rule}. More serious action will be taken the next time you do so.`
  } else if (sentence.includes('mute/ban')) {
    type = 'error'
    reply = `Unable to process \`${sentence}\`, please mod manualy.`
  } else if (sentence.includes('mute')) {
    type = 'mute'
    reply = `<@${target}>, you have broken rule ${rule} and have been muted ${duration === null ? '' : `for ${duration}`}`
  } else if (sentence.includes('ban')) {
    type = 'ban'
    reply = `<@${target}>, you have broken rule ${rule} and have been banned`
  } else {
    type = 'error'
    reply = `Unable to process \`${sentence}\`, please mod manualy.`
  }

  if (time !== null) {
    entry.type = 'unmute'
    entry.target = target
    entry.mod = mod
    entry.time = time
    msg._client.mongo.collection('tasks').insertOne(entry)
  }

  if (type === 'mute') {
    task.mute(msg._client, target, mod, `Breaking rule ${rule} ${duration === null ? '' : `(for ${duration})`}`)
  } else if (type === 'ban') {
    task.ban(msg._client, target, mod, `Breaking rule ${rule}`)
  }

  return msg.channel.createMessage(reply)
}
