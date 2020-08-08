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
Message contents: \`\`\`
$message
\`\`\`
`.trim()

module.exports = {
  register (bot) {
    bot.on('messageDelete', (msg) => {
      if (!msg.author || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot) {
        return // Message not cached; let's just ignore
      }

      const cleanMessage = msg.cleanContent.replace(/`/g, `\`${zws}`)
      bot.createMessage(config.discord.ids.channelMessageLogs, template
        .replace('$channelId', msg.channel.id)
        .replace('$username', msg.author.username)
        .replace('$discrim', msg.author.discriminator)
        .replace(/\$userId/g, msg.author.id)
        .replace('$message', cleanMessage)
      )
    })
  }
}
