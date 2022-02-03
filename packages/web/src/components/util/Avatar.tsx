/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { MinimalUser } from '@powercord/types/users'
import { useState, useCallback } from 'preact/hooks'
import { h } from 'preact'

import { Endpoints } from '../../constants'

import style from './avatar.module.css'

type AvatarProps = { user: MinimalUser, class?: string }

export function DiscordAvatar ({ user, class: className }: AvatarProps) {
  const avatar = user.avatar
    ? Endpoints.USER_AVATAR_DISCORD(user.id, user.avatar)
    : Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator))

  const [ effectiveAvatar, setAvatar ] = useState(avatar)
  const onError = useCallback(() => setAvatar(Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator))), [])

  return (
    <img
      src={effectiveAvatar}
      alt={`${user.username}'s avatar`}
      className={className ? `${style.avatar} ${className}` : style.avatar}
      onError={onError}
    />
  )
}

export default function Avatar ({ user, class: className }: AvatarProps) {
  return (
    <img
      src={Endpoints.USER_AVATAR(user.id)}
      alt={`${user.username}'s avatar`}
      className={className ? `${style.avatar} ${className}` : style.avatar}
    />
  )
}
