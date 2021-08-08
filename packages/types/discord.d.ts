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

export type User = {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  bot?: boolean
  system?: boolean
  mfa_enabled?: boolean
  locale?: string
  flags?: number
  premium_type?: number
  public_flags?: number
}

export type Member = {
  user: User
  nick?: string | null
  roles: string[]
  joined_at: string
  premium_since?: string | null
  deaf: boolean
  mute: boolean
  pending?: boolean
  permissions?: string
}

// Note: type is incomplete
export type ApiMessage = {
  id: string
  channel_id: string
  guild_id?: string
  author: User
  member?: Member
  content: string
  timestamp: string
  thread?: { id: string }
}
