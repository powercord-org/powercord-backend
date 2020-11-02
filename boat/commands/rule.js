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

const config = require('../../config.json')
const { parseRule } = require('../utils')

const INFO_STR = `You can read all of the server rules in <#${config.discord.ids.channelRules}>.`
const USAGE_STR = `Usage: ${config.discord.prefix}rule <rule id>`

module.exports = async function (msg, args) {
  if (args.length === 0) {
    return msg.channel.createMessage(`${USAGE_STR}\n\n${INFO_STR}`)
  }

  const id = parseInt(args[0])
  const rule = await parseRule(id, msg)

  if (rule === null) {
    return msg.channel.createMessage(`This rule doesn't exist.\n${USAGE_STR}\n\n${INFO_STR}`)
  }

  msg.channel.createMessage(`**Rule #${id}**: ${rule}\n\n${INFO_STR}`)
}
