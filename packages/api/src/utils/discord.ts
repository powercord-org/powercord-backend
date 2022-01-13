/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

// todo: use crapcord instead

import type { User, Member, ApiMessage } from '@powercord/types/discord'
import fetch from 'node-fetch'
import config from '@powercord/shared/config'

/// Users

/**
 * @deprecated
 */
export async function fetchUser (userId: string): Promise<User> {
  return fetch(`https://discord.com/api/v9/users/${userId}`, { headers: { authorization: `Bot ${config.discord.botToken}` } })
    .then((r) => r.json())
}

/**
 * @deprecated
 */
export async function fetchCurrentUser (token: string): Promise<User> {
  return fetch('https://discord.com/api/v9/users/@me', { headers: { authorization: `Bearer ${token}` } })
    .then((r) => r.json())
}

/// DM

/**
 * @deprecated
 */
export async function sendDm (userId: string, message: string): Promise<boolean> {
  const channel = await fetch('https://discord.com/api/v9/users/@me/channels', {
    method: 'POST',
    headers: {
      authorization: `Bot ${config.discord.botToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: userId }),
  }).then((r) => r.json())

  if (!channel.id) return false
  const res = await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
    method: 'POST',
    headers: {
      authorization: `Bot ${config.discord.botToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ content: message.replace('$username', channel.recipients[0].username) }),
  })

  return res.status === 200
}

/// Honks

/**
 * @deprecated
 */
export async function dispatchHonk (honk: string, payload: unknown, query?: string): Promise<ApiMessage> {
  return fetch(`https://discord.com/api/v9/webhooks/${honk}?wait=true&${query ?? ''}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json())
}

/**
 * @deprecated
 */
export async function fetchHonkMessage (honk: string, message: string): Promise<ApiMessage> {
  return fetch(`https://discord.com/api/v9/webhooks/${honk}/messages/${message}`).then((r) => r.json())
}

/**
 * @deprecated
 */
export async function editHonkMessage (honk: string, message: string, payload: unknown): Promise<ApiMessage> {
  return fetch(`https://discord.com/api/v9/webhooks/${honk}/messages/${message}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json())
}

/// Members management

/**
 * @deprecated
 */
export async function fetchAllMembers (): Promise<Member[]> {
  const users: Member[] = []
  let res: Member[] = []

  do {
    const after = res.length ? res[res.length - 1].user.id : '0'
    res = await fetch(
      `https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members?limit=1000&after=${after}`,
      { headers: { authorization: `Bot ${config.discord.botToken}` } }
    ).then((r) => r.json())

    users.push(...res)
  } while (res.length === 1000)

  return users
}

/**
 * @deprecated
 */
export async function fetchMember (memberId: string): Promise<Member | undefined> {
  return fetch(
    `https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}`,
    { headers: { authorization: `Bot ${config.discord.botToken}` } }
  ).then((r) => r.status === 200 ? r.json() : void 0)
}

/**
 * @deprecated
 */
export async function setRoles (memberId: string, roleIds: string[], auditLogReason?: string): Promise<unknown> {
  const headers: Record<string, string> = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) headers['X-Audit-Log-Reason'] = auditLogReason

  return fetch(`https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}`, {
    headers: headers,
    method: 'PATCH',
    body: JSON.stringify({ roles: roleIds }),
  })
}

/**
 * @deprecated
 */
export async function addRole (memberId: string, roleId: string, auditLogReason?: string): Promise<unknown> {
  const headers: Record<string, string> = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) headers['X-Audit-Log-Reason'] = auditLogReason

  return fetch(`https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}/roles/${roleId}`, {
    headers: headers,
    method: 'PUT',
  })
}

/**
 * @deprecated
 */
export async function removeRole (memberId: string, roleId: string, auditLogReason?: string): Promise<unknown> {
  const headers: Record<string, string> = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) headers['X-Audit-Log-Reason'] = auditLogReason

  return fetch(`https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}/roles/${roleId}`, {
    headers: headers,
    method: 'DELETE',
  })
}
