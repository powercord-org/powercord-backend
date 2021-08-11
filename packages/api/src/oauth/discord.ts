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

import type { FastifyInstance } from 'fastify'
import type { User as DiscordUser } from '@powercord/types/discord'
import type { User } from '@powercord/types/users'
import OAuth from './oauth.js'
import { fetchCurrentUser } from '../utils/discord.js'
import config from '../config.js'

class Discord extends OAuth<DiscordUser> {
  constructor () {
    super(
      config.discord.clientID,
      config.discord.clientSecret,
      'https://discord.com/oauth2/authorize',
      'https://discord.com/api/v9/oauth2/token'
    )
  }

  // eslint-disable-next-line class-methods-use-this
  get scopes () {
    return [ 'identify' ]
  }

  // eslint-disable-next-line class-methods-use-this
  async getCurrentUser (token: string) {
    return fetchCurrentUser(token)
  }
}

const discordOauth = new Discord()

export async function refreshUserData (fastify: FastifyInstance, user: User): Promise<User | null> {
  if (Date.now() < user.accounts.discord.expiryDate) return user

  // Refresh account data
  try {
    const newTokens = await discordOauth.refreshToken(user.accounts.discord.refreshToken)
    const userData = await discordOauth.getCurrentUser(newTokens.access_token)
    const updatedUser = await fastify.mongo.db!.collection<User>('users').findOneAndUpdate({ _id: userData.id }, {
      $set: {
        updatedAt: new Date(),
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        'accounts.discord.accessToken': newTokens.access_token,
        'accounts.discord.refreshToken': newTokens.refresh_token,
        'accounts.discord.expiryDate': Date.now() + newTokens.expires_in,
      },
    }, { returnDocument: 'after' })

    return updatedUser.value!
  } catch {
    // Do nothing
  }

  return null
}

export default discordOauth
