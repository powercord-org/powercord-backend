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

import type { MinimalUser } from '@powercord/types/users'
import { useState, useCallback } from 'preact/hooks'
import { h } from 'preact'

import { Endpoints } from '../../constants'

import style from './avatar.module.css'

type AvatarProps = { user: MinimalUser }

export function DiscordAvatar ({ user }: AvatarProps) {
  const avatar = user.avatar
    ? Endpoints.USER_AVATAR_DISCORD(user.id, user.avatar)
    : Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator))

  const [ effectiveAvatar, setAvatar ] = useState(avatar)
  const onError = useCallback(() => setAvatar(Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator))), [])

  return <img src={effectiveAvatar} alt={`${user.username}'s avatar`} onError={onError} className={style.avatar}/>
}

export default function Avatar ({ user }: AvatarProps) {
  return <img src={Endpoints.USER_AVATAR(user.id)} alt={`${user.username}'s avatar`} className={style.avatar}/>
}
