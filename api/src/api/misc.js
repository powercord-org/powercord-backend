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

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const discord = require('../utils/discord')
const cache = require('../utils/cache')

const plugXml = fs.readFileSync(path.join(__dirname, '../../src/assets/powercord.svg'), 'utf8')

function plug (request, reply) {
  reply.type('image/svg+xml').send(plugXml.replace('7289DA', request.params.color))
}

async function getDiscordAvatar (user, update) {
  if (!user.avatar) {
    return fetch(`https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`).then(r => r.buffer())
  }

  const file = await cache.remoteFile(`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png?size=256`)
  if (!file.success) {
    const discordUser = await discord.fetchUser(user._id)
    update(discordUser.avatar)
    user.avatar = discordUser.avatar
    return getDiscordAvatar(user, update)
  }
  return file.data
}

async function avatar (request, reply) {
  const user = await this.mongo.db.collection('users').findOne({ _id: request.params.id })
  if (!user) {
    return reply.code(422).send()
  }

  if (!user.avatar) {
    // todo: How to deal with those cases?
    // this means default avatar has to be displayed
    // but if we reach this state the avatar will never be updated to newer ones
  }
  reply.type('image/png')
  return getDiscordAvatar(user, avatar => this.mongo.db.collection('users').updateOne({ _id: request.params.id }, { $set: { avatar } }))
}

module.exports = async function (fastify) {
  fastify.get('/plug/:color([a-fA-F0-9]{6})', plug)
  fastify.get('/avatar/:id(\\d+).png', avatar)
}
