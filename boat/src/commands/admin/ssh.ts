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
import { exec } from 'child_process'
import fetch from 'node-fetch'
import config from '../../config.js'

export async function executor (msg: Message<GuildTextableChannel>): Promise<void> {
  if (!msg.member) return // ???
  if (!msg.member.permissions.has('administrator')) {
    msg.channel.createMessage('haha no')
    return
  }

  const cmd = msg.content.slice(config.discord.prefix.length + 4)
  if (!cmd) {
    msg.channel.createMessage('do you want me to run `rm -fr /`?')
    return
  }

  const m = await msg.channel.createMessage('<a:loading:660094837437104138> Computing...')
  const start = Date.now()

  exec(cmd, async (e, out, err) => {
    const result = e ? err : out

    const processing = ((Date.now() - start) / 1000).toFixed(2)
    if (result.length > 1900) {
      const res = await fetch('https://haste.powercord.dev/documents', { method: 'POST', body: result }).then(r => r.json())
      m.edit(`Result too long for Discord: <https://haste.powercord.dev/${res.key}.txt>\nTook ${processing} seconds.`)
    } else {
      m.edit(`\`\`\`\n${result}\n\`\`\`\nTook ${processing} seconds.`)
    }
  })
}
