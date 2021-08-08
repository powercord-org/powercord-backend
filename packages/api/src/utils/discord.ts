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

import type { User, Member, ApiMessage } from '@powercord/types/discord'
import fetch from 'node-fetch'
import config from '../config.js'

/// Generic API stuff

export async function fetchUser (userId: string): Promise<User> {
  return fetch(`https://discord.com/api/v9/users/${userId}`, { headers: { authorization: `Bot ${config.discord.botToken}` } })
    .then((r) => r.json())
}

export async function fetchCurrentUser (token: string): Promise<User> {
  return fetch('https://discord.com/api/v9/users/@me', { headers: { authorization: `Bearer ${token}` } })
    .then((r) => r.json())
}

export async function dispatchHonk (honk: string, payload: unknown): Promise<ApiMessage> {
  return fetch(`https://discord.com/api/v9/webhooks/${honk}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json())
}

export async function fetchHonkMessage (honk: string, message: string): Promise<ApiMessage> {
  return fetch(`https://discord.com/api/v9/webhooks/${honk}/${message}`).then((r) => r.json())
}

export async function editHonkMessage (honk: string, message: string, payload: unknown): Promise<ApiMessage> {
  return fetch(`https://discord.com/api/v9/webhooks/${honk}/${message}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json())
}

/// Members management

export async function fetchAllMembers (): Promise<Member[]> {
  const users: Member[] = []
  let res: Member[] = []

  do {
    const after = res.length ? res[res.length - 1].user.id : '0'
    res = await fetch(
      `https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members?limit=1000&after=${after}`,
      { headers: { authorization: `Bot ${config.discord.botToken}` } }
    ).then((r) => r.json())

    users.concat(res)
  } while (res.length === 1000)

  return users
}

export async function fetchMember (memberId: string): Promise<Member> {
  return fetch(
    `https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}`,
    { headers: { authorization: `Bot ${config.discord.botToken}` } }
  ).then((r) => r.json())
}

export async function setRoles (memberId: string, roleIds: string[], auditLogReason?: string): Promise<unknown> {
  const headers: Record<string, string> = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) headers['X-Audit-Log-Reason'] = auditLogReason

  return fetch(`https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}`, {
    headers: headers,
    method: 'PATCH',
    body: JSON.stringify({ roles: roleIds }),
  })
}

export async function addRole (memberId: string, roleId: string, auditLogReason?: string): Promise<unknown> {
  const headers: Record<string, string> = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) headers['X-Audit-Log-Reason'] = auditLogReason

  return fetch(`https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}/roles/${roleId}`, {
    headers: headers,
    method: 'PUT',
  })
}

export async function removeRole (memberId: string, roleId: string, auditLogReason?: string): Promise<unknown> {
  const headers: Record<string, string> = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) headers['X-Audit-Log-Reason'] = auditLogReason

  return fetch(`https://discord.com/api/v9/guilds/${config.discord.ids.serverId}/members/${memberId}/roles/${roleId}`, {
    headers: headers,
    method: 'DELETE',
  })
}
