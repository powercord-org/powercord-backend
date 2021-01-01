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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '../types.js'
import { URL } from 'url'
import { readFileSync } from 'fs'
import fetch from 'node-fetch'
import { fetchUser } from '../utils/discord.js'
import { remoteFile } from '../utils/cache.js'

// todo: use smth else?
const plugXml = readFileSync(new URL('../../../web/src/assets/powercord.svg', import.meta.url), 'utf8')

function plug (request: FastifyRequest<{ Params: { color: string } }>, reply: FastifyReply): void {
  reply.type('image/svg+xml').send(plugXml.replace(/7289DA/g, request.params.color))
}

async function getDiscordAvatar (user: User, update: (avatar: string) => void): Promise<Buffer> {
  if (!user.avatar) {
    return fetch(`https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`).then(r => r.buffer())
  }

  const file = await remoteFile(new URL(`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png?size=256`))
  if (!file.success) {
    const discordUser = await fetchUser(user._id)
    update(discordUser.avatar)
    user.avatar = discordUser.avatar
    return getDiscordAvatar(user, update)
  }

  return file.data
}

async function avatar (this: FastifyInstance, request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<Buffer | void> {
  const user = await this.mongo.db!.collection('users').findOne({ _id: request.params.id })
  if (!user) {
    reply.code(422).send()
    return
  }

  if (!user.avatar) {
    // todo: How to deal with those cases?
    // this means default avatar has to be displayed
    // but if we reach this state the avatar will never be updated to newer ones
  }

  reply.type('image/png')
  return getDiscordAvatar(user, (avatar) => this.mongo.db!.collection('users').updateOne({ _id: request.params.id }, { $set: { avatar } }))
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/plug/:color([a-fA-F0-9]{6})', plug)
  fastify.get('/avatar/:id(\\d+).png', avatar)
}
