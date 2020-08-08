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

const sniper = require('../sniper')

const ANIMALS = [
  '🦅', '🐦', '🦄', '🐙', '🐢', '🐌', '🐬', '🐠', '🦈', '🦏',
  '🐖', '🦒', '🦘', '🐘', '🐳', '🐕', '🐑', '🐓', '🦜', '🦥',
  '🐿️', '🦔', '🦩', '🦢'
]

module.exports = function (msg) {
  if (sniper.lastMessages.length === 0) {
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    return msg.channel.createMessage(`${animal} There is nothing to snipe.`)
  }

  msg.channel.createMessage({
    embed: {
      description: `Edits and deletes for the last ${sniper.SNIPE_LIFETIME} seconds`,
      fields: sniper.lastMessages.map(snipe => ({
        name: `${snipe.author} (${snipe.type})`,
        value: snipe.msg
      })),
      footer: {
        text: `🕵️ Sniped by ${msg.author.username}#${msg.author.discriminator}`
      }
    }
  })

  sniper.lastMessages = []
}
