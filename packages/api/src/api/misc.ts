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
import type { User as DiscordUser } from '@powercord/types/discord'
import type { User } from '@powercord/types/users'
import { URL } from 'url'
import { createHash } from 'crypto'
import fetch from 'node-fetch'
import { fetchUser } from '../utils/discord.js'
import { remoteFile } from '../utils/cache.js'
import config from '../config.js'

type AvatarRequest = { TokenizeUser: User, Params: { id: string } }

const plugXml = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447 447">
  <path fill="#99AAB5" d="M221,117.1l-33.8-33.8l70-70c9.3-9.3,24.5-9.3,33.8,0l0,0c9.3,9.3,9.3,24.5,0,33.8L221,117.1L221,117.1z"/>
  <path fill="#23272A" d="M216.3,121.7l-33.8-33.8c-2.6-2.6-2.6-6.8,0-9.3l70-70c11.9-11.9,31.2-11.9,43.1,0s11.9,31.2,0,43.1l-70,70 C223,124.3,218.9,124.3,216.3,121.7z M196.5,83.3l24.5,24.5l65.3-65.3c6.7-6.7,6.7-17.7,0-24.5c-6.7-6.7-17.7-6.7-24.5,0L196.5,83.3 L196.5,83.3z"/>
  <path fill="#99AAB5" d="M312.7,208.8L278.9,175l70-70c9.3-9.3,24.5-9.3,33.8,0l0,0c9.3,9.3,9.3,24.5,0,33.8L312.7,208.8L312.7,208.8z"/>
  <path fill="#23272A" d="M308,213.4l-33.8-33.8c-2.6-2.6-2.6-6.8,0-9.3l70-70c11.9-11.9,31.2-11.9,43.1,0s11.9,31.2,0,43.1l-70,70 C314.8,216,310.6,216,308,213.4z M288.2,175l24.5,24.5l65.3-65.3c6.7-6.7,6.7-17.7,0-24.5s-17.7-6.7-24.5,0L288.2,175L288.2,175z"/>
  <rect fill="#23272A" x="220.8" y="42" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -42.1158 214.494)" width="34.1" height="232.1"/>
  <path fill="#23272A" d="M303,257L138.9,92.9c-2.7-2.7-2.7-7,0-9.7L163,59.1c2.7-2.7,7-2.7,9.7,0l164.1,164.1c2.7,2.7,2.7,7,0,9.7 L312.7,257C310,259.7,305.7,259.7,303,257z M153.4,88.1l154.5,154.5l14.5-14.5L167.9,73.6L153.4,88.1z"/>
  <path fill="#7289DA" d="M161.2,327.6l-92.9-92.9c-14.3-14.3-14.3-37.6,0-51.9l85.1-85.1l144.8,144.8l-85.1,85.1 C198.8,342,175.5,342,161.2,327.6z"/>
  <path fill="#23272A" d="M156.4,332.4l-92.9-92.9c-17-17-17-44.6,0-61.6l85.1-85.1c2.7-2.7,7-2.7,9.7,0L303,237.7c2.7,2.7,2.7,7,0,9.7 L218,332.4C201,349.4,173.3,349.4,156.4,332.4z M153.4,107.4l-80.2,80.2c-11.7,11.7-11.7,30.6,0,42.3l92.9,92.9 c11.7,11.7,30.6,11.7,42.3,0l80.2-80.2L153.4,107.4z"/>
  <rect fill="#23272A" x="79.8" y="275.2" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -179.6926 157.5037)" width="41" height="41"/>
  <path fill="#23272A" d="M95.4,329.5l-29-29c-2.7-2.7-2.7-7,0-9.7l29-29c2.7-2.7,7-2.7,9.7,0l29,29c2.7,2.7,2.7,7,0,9.7l-29,29 C102.4,332.1,98.1,332.1,95.4,329.5z M81,295.7l19.3,19.3l19.3-19.3l-19.3-19.3L81,295.7z"/>
  <path fill="#23272A" d="M143.7,445.3L81,382.6c-21.3-21.3-21.3-55.9,0-77.2c2.7-2.7,7-2.7,9.7,0c2.7,2.7,2.7,7,0,9.7 c-16,16-16,42,0,57.9l62.8,62.8c2.7,2.7,2.7,7,0,9.7S146.4,448,143.7,445.3z"/>
</svg>
`

function plug (request: FastifyRequest<{ Params: { color: string } }>, reply: FastifyReply): void {
  reply.type('image/svg+xml').send(plugXml.replace(/7289DA/g, request.params.color))
}

async function getDiscordAvatar (user: User, update: (user: DiscordUser) => void): Promise<Buffer> {
  if (!user.avatar) {
    return fetch(`https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 6}.png`).then((r) => r.buffer())
  }

  const file = await remoteFile(new URL(`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png?size=256`))
  if (!file.success) {
    const discordUser = await fetchUser(user._id)
    // eslint-disable-next-line require-atomic-updates
    user.avatar = discordUser.avatar
    update(discordUser)

    return getDiscordAvatar(user, update)
  }

  return file.data
}

// This route is very restricted to prevent abuse.
// Only avatar of people shown on /contributors & authenticated user can be fetched.
async function avatar (this: FastifyInstance, request: FastifyRequest<AvatarRequest>, reply: FastifyReply): Promise<Buffer | void> {
  let user = request.user!
  if (request.params.id !== request.user?._id.toString()) {
    const dbUser = await this.mongo.db!.collection<User>('users').findOne({
      _id: request.params.id,
      $or: [
        { 'badges.developer': true },
        { 'badges.staff': true },
        { 'badges.support': true },
        { 'badges.contributor': true },
      ],
    })

    user = dbUser!
    if (!user) {
      reply.code(422).send()
      return
    }
  }

  const effectiveAvatarId = user.avatar ?? user.discriminator
  const etag = `W/"${createHash('sha1').update(config.secret).update(user._id).update(effectiveAvatarId).digest('base64')}"`

  reply.type('image/png')
  reply.header('cache-control', 'public, max-age=86400')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag)
  return getDiscordAvatar(user, (newUser) => this.mongo.db!.collection<User>('users').updateOne(
    { _id: newUser.id },
    {
      $set: {
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        updatedAt: new Date(),
      },
    }
  ))
}

export default async function (fastify: FastifyInstance): Promise<void> {
  const optionalAuth = fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ])

  fastify.get<AvatarRequest>('/avatar/:id(\\d+).png', { preHandler: optionalAuth }, avatar)
  fastify.get('/plug/:color([a-fA-F0-9]{6})', plug)
}
