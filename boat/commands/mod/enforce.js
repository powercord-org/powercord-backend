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

const USAGE_STR = `Usage: ${config.discord.prefix}enforce [mention] [ruleID]`

module.exports = async function (msg, args) {
  if (!msg.member.permission.has('manageMessages')) {
    return msg.channel.createMessage('no')
  }

  if (args.length < 2) {
    return msg.channel.createMessage(USAGE_STR)
  }

  if (args[1] > 10 || args[1] < 1) {
    return msg.channel.createMessage('Please provide a valid ruleID')
  }

  const target = args.shift().replace(/<@!?(\d+)>/, '$1')
  const rule = parseInt(args[0])
  const actions = await processRule(msg, rule)
  const entry = await msg._client.mongo.collection('enforce').findOne({ _id: target }) || {
    cases: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
  }

  if (target === msg.author.id) {
    return msg.channel.createMessage('I thought you don\'t break rules')
  }
  
  if (actions[entry.cases[rule - 1]]) {
    punish(msg, target, actions[entry.cases[rule - 1]++], rule)
  } else {
    return msg.channel.createMessage(`The mamixmum punishment has already been applied for rule ${rule}`)
  }

  msg._client.mongo.collection('enforce').updateOne(
    { _id: target },
    { $set: { ...entry } },
    { upsert: true }
  )
}

async function processRule (msg, id) {
  const messages = await msg._client.getMessages(config.discord.ids.channelRules)
  let rules
  messages.reverse().forEach(msg => {
    rules += msg.content.slice(6, msg.content.length - 3)
  })
  rules += '||||'

  const match = rules.match(new RegExp(`\\[0?${id}] (([^\\[]*)([^\\d]*)([^\\]]*))`))
  if (!match) {
    return msg.channel.createMessage('This rule doesn\'t exist.')
  }

  const rule = match[1].split('\n').map(s => s.trim()).join(' ')
    .replace(/\[#[^a-z0-9-_]?([a-z0-9-_]+)\]/ig, (og, name) => {
      const channel = msg.channel.guild.channels.find(c => c.name === name)
      return channel ? `<#${channel.id}>` : og
    })
    .replace(/Actions: /, '\nActions: ')

  return rule.slice(0, rule.length - 4).split('Actions:')[1].trim().split(' -> ')
}

async function punish (msg, target, sentence, rule) {
  const entry = task.EMPTY_TASK_OBJ
  let reply, type, duration, time, mod = `${msg.author.username}#${msg.author.discriminator}`

  if (sentence.includes('12h')) {
    duration = '12h'
    time = Date.now() + 12 * 1000 * 60 * 60
  } else if (sentence.includes('2h')){
    duration = '2h'
    time = Date.now() + 2 * 1000 * 60 * 60
  } else if (sentence.includes('3d')) {
    duration = '3d'
    time = Date.now() + 3 * 24 * 1000 * 60 * 60
  } else if (sentence.includes('7d')) {
    duration = '7d'
    time = Date.now() + 7 * 24 * 1000 * 60 * 60
  } else {
    duration = null
    time = null
  }

  if (sentence.includes('warning')) {
    type = 'warning'
    reply = `<@${target}>, you have broken rule ${rule}. More serious action will be taken the next time you do so.`
  } else if (sentence.includes('mute/ban')) {
    type = 'error'
    reply = `Unable to process \`${sentence}\`, please mod manualy.`
  } else if (sentence.includes('mute')) {
    type = 'mute'
    reply = `<@${target}>, you have broken rule ${rule} and have been muted ${duration === null ? '': `for ${duration}`}`
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
