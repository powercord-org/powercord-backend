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

const fetch = require('node-fetch')
const config = require('../../../../config.json')
const zws = '\u200B'

const FAQ_DOCUMENT = 'https://raw.githubusercontent.com/wiki/powercord-org/powercord/Frequently-Asked-Questions.md'
module.exports = async function (msg) {
  if (!msg.member.permission.has('administrator')) {
    return msg.channel.createMessage('lol')
  }

  const message = await msg.channel.createMessage('<a:loading:660094837437104138> Processing...')
  const faq = await fetch(FAQ_DOCUMENT).then(r => r.text()).then(f =>
    // This is super janky but gets the job done lol
    f.replace(/\[(Discord server)]\([^)]+\)/ig, '$1') // Drop discord.gg link
      .replace(/\[([^\]]+)]\(([^)]+)\)/ig, '$1: $2') // Make links plain
      .split('\n\n## ') // Split in sections
      .slice(1) // Drop title
      .map(f => {
        f = `**${f.replace('\n', '**\n\n')}` // Bold title
        f = f.replace(/(.)\n([^\n#])/g, '$1 $2').replace(/<br\/?>/g, '\n') // Linebreak fixes
        f = f.replace('**\n\n', '**\n') // Title fix
        f = f.replace(/(^|\n) 1\./g, '$1  1.') // List spacing fix
        return f.replace(/#[^a-z0-9-_]?([a-z0-9-_]+)/ig, (og, name) => { // Channels
          const channel = msg.channel.guild.channels.find(c => c.name === name)
          return channel ? `<#${channel.id}>` : og
        })
      })
  )

  // Purge channel
  const messages = await msg._client.getMessages(config.discord.ids.channelFaq)
  await msg._client.deleteMessages(config.discord.ids.channelFaq, messages.map(m => m.id), 'Purging FAQ channel due to sync')

  console.log(faq)
  for (const part of faq) {
    await msg._client.createMessage(config.discord.ids.channelFaq, `${part}\n${zws}`)
  }

  message.edit('Done!')
}
