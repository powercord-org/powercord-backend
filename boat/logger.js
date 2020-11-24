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

const zws = '\u200B'
const template = `
Message deleted in <#$channelId>
Author: $username#$discrim ($userId; <@$userId>)
Timestamp: $time ($duration ago)
Message contents: \`\`\`
$message
\`\`\`
`.trim()

function humanTime (time) {
  const plurialify = (c, w) => c === 1 ? w : `${w}s`
  const h = Math.floor(time / 3600e3)
  const m = Math.floor((time - h * 3600e3) / 60e3)
  const s = Math.floor((time - h * 3600e3 - m * 60e3) / 1e3)
  return [
    h ? `${h} ${plurialify(h, 'hour')}` : '',
    m ? `${m} ${plurialify(m, 'minute')}` : '',
    s ? `${s} ${plurialify(s, 'second')}` : ''
  ].filter(Boolean).join(', ') || 'under a second'
}

module.exports = {
  register (bot) {
    bot.on('messageDelete', (msg) => {
      if (!msg.author || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot) {
        return // Message not cached; let's just ignore
      }

      const cleanMessage = msg.cleanContent.replace(/`/g, `\`${zws}`)
      const cleanUsername = msg.author.username.replace(/@/g, `@${zws}`).replace(/`/g, `\`${zws}`)
      const time = new Date(msg.timestamp)
      bot.createMessage(config.discord.ids.channelMessageLogs, template
        .replace('$channelId', msg.channel.id)
        .replace('$username', cleanUsername)
        .replace('$discrim', msg.author.discriminator)
        .replace(/\$userId/g, msg.author.id)
        .replace('$time', time.toUTCString())
        .replace('$duration', humanTime(Date.now() - time))
        .replace('$message', cleanMessage)
      )
    })
  }
}
