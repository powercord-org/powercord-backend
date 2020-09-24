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

  const fields = [ [] ]
  let cursor = 0
  let length = 0
  for (const snipe of sniper.lastMessages) {
    const name = `${snipe.author} (${snipe.type})`
    if (fields[cursor].length === 25 || length + name.length + Math.floor(snipe.msg.length / 1024) * 3 + snipe.msg.length >= 5900) {
      fields.push([])
      length = 0
      cursor++
    }

    length += name.length + snipe.msg.length
    fields[cursor].push({
      name: `${snipe.author} (${snipe.type})`,
      value: snipe.msg.slice(0, 1024)
    })

    if (snipe.msg.length > 1024) {
      fields[cursor].push({
        name: '...',
        value: snipe.msg.slice(1024)
      })
    }
  }

  sniper.lastMessages = []
  fields.forEach((f, i) => {
    const embed = { fields: f }
    if (i === 0) {
      embed.description = `Edits and deletes for the last ${sniper.SNIPE_LIFETIME} seconds`
    }
    if (i === fields.length - 1) {
      embed.footer = { text: `Sniped by ${msg.author.username}#${msg.author.discriminator}` }
    }

    msg.channel.createMessage({ embed })
  })
}
