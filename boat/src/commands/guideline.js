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
const config = require('../../../config.json')

const GUIDELINES_DOCUMENT = 'https://raw.githubusercontent.com/powercord-community/guidelines/master/README.md'
const INFO_STR = 'You can read all of the guidelines at <https://powercord.dev/guidelines>.'
const USAGE_STR = `Usage: \`${config.discord.prefix}guideline <guideline id>\` or \`${config.discord.prefix}guideline defs\` `

module.exports = async function (msg, args) {
  if (args.length === 0) {
    return msg.channel.createMessage(`${USAGE_STR}\n\n${INFO_STR}`)
  }

  try {
    const guidelines = await fetch(GUIDELINES_DOCUMENT).then(r => r.text())

    if (args[0] === 'defs') {
      const defs = guidelines.split('## Definitions')[1].split('\n\n')[0].trim().split('\n')
      const fields = []
      defs.forEach(def => {
        fields.push({
          name: def.split(':')[0].replace('-', ' ').trim(),
          value: def.split(':')[1]
        })
      })
      const embed = {
        title: 'Definitions',
        description: INFO_STR,
        fields
      }
      return msg.channel.createMessage({ embed })
    }

    const id = parseInt(args[0])
    const match = guidelines.match(new RegExp(`# (${id}[^#]*)`))
    if (!match) {
      return msg.channel.createMessage(`This guideline doesn't exist.\n${USAGE_STR}\n\n${INFO_STR}`)
    }

    const guideline = match[0].slice(2).replace(/\n\n/g, '<br><br>').split('\n')
    const embed = {
      title: guideline.shift(),
      description: guideline.map(g => g.replace(/<br>/g, '\n')).join('').trim(),
      fields: [
        {
          name: 'Read all the guidelines',
          value: 'https://powercord.dev/guidelines'
        }
      ]
    }
    msg.channel.createMessage({ embed })
  } catch (e) {
    console.error('error occurred while fetching guidelines', e)
    msg.channel.createMessage('An unexpected error occurred. Maybe GitHub is having troubles?')
  }
}
