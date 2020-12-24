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

const config = require('../config.json')

const utils = {
  async parseRule (ruleID, msg) {
    const messages = await msg._client.getMessages(config.discord.ids.channelRules)
    let rules
    messages.reverse().forEach(msg => {
      rules += msg.content.slice(6, msg.content.length - 3)
    })
    rules += '||||' // without this the last rule will get chopped off by the slice on 53

    const match = rules.match(new RegExp(`\\[0?${ruleID}] (([^\\[]*)([^\\d]*)([^\\]]*))`))
    if (!match) {
      return null
    }

    const rule = match[1].split('\n').map(s => s.trim()).join(' ')
      .replace(/\[#[^a-z0-9-_]?([a-z0-9-_]+)\]/ig, (og, name) => {
        const channel = msg.channel.guild.channels.find(c => c.name === name)
        return channel ? `<#${channel.id}>` : og
      })
      .replace(/Actions: /, '\nActions: ')

    return rule.slice(0, rule.length - 4).trim()
  },

  parseDuration (rawDuration) {
    if (rawDuration.endsWith('m')) {
      return rawDuration.match(/\d+/)[0] * 1000 * 60
    } else if (rawDuration.endsWith('h')) {
      return rawDuration.match(/\d+/)[0] * 1000 * 60 * 60
    } else if (rawDuration.endsWith('d')) {
      return rawDuration.match(/\d+/)[0] * 1000 * 60 * 60 * 24
    } else {
      return null
    }
  },

  humanTime (time) {
    const y = Math.floor(time / 31536000e3)
    const d = Math.floor((time - y * 31536000e3) / 86400e3)
    const h = Math.floor((time - y * 31536000e3 - d * 86400e3) / 3600e3)
    const m = Math.floor((time - y * 31536000e3 - d * 86400e3 - h * 3600e3) / 60e3)
    const s = Math.floor((time - y * 31536000e3 - d * 86400e3 - h * 3600e3 - m * 60e3) / 1e3)
    return [
      y ? `${y} ${utils.plurialify(y, 'year')}` : '',
      d ? `${d} ${utils.plurialify(h, 'day')}` : '',
      h ? `${h} ${utils.plurialify(h, 'hour')}` : '',
      m ? `${m} ${utils.plurialify(m, 'minute')}` : '',
      s ? `${s} ${utils.plurialify(s, 'second')}` : ''
    ].filter(Boolean).join(', ') || 'under a second'
  },

  plurialify (count, word) {
    return count === 1 ? word : `${word}s`
  }
}

module.exports = utils
