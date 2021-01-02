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

import type { FastifyReply } from 'fastify'

export type User = {
  _id: string
  createdAt: Date
  username: string
  discriminator: string
  avatar: string | null
  badges: {
    developer: boolean
    staff: boolean
    support: boolean
    contributor: boolean
    hunter: boolean
    early: boolean
    translator: boolean // todo: array(?) of langs
    custom: {
      color: string | null
      icon: string | null
      white: string | null
      name: string | null
    }
  }
  accounts: {
    discord: {
      accessToken: string
      refreshToken: string
      expiryDate: number
    }
    spotify: {
      accessToken: string,
      refreshToken: string,
      expiryDate: number
      name: string,
      scopes: string[]
    }
  }
  patronTier?: 0 | 1 | 2
}

export type RestUser = Omit<User, '_id' | 'accounts' | 'createdAt'> & { id: User['_id'] }

export type DiscordUser = any // todo

export type DiscordMember = any // todo

export type ConfiguredReply<TReply extends FastifyReply, TConfig> =
  TReply extends FastifyReply<infer TServer, infer TRequest, infer TReply, infer TGeneric> 
    ? FastifyReply<TServer, TRequest, TReply, TGeneric, TConfig>
    : never
