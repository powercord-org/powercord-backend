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

const fetch = require('node-fetch')
const config = require('../../config.json')

function fetchUser (userId) {
  return fetch(`https://discord.com/api/v6/users/${userId}`, { headers: { authorization: `Bot ${config.discord.botToken}` } })
    .then(r => r.json())
}

function fetchCurrentUser (token) {
  return fetch('https://discord.com/api/v6/users/@me', { headers: { authorization: `Bearer ${token}` } })
    .then(r => r.json())
}

function dispatchHonk (honk, payload) {
  return fetch(`https://discord.com/api/v6/webhooks/${honk}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

async function fetchAllMembers () {
  const users = []
  let halt = false
  let after = '0'
  while (!halt) {
    const res = await fetch(
      `https://discord.com/api/v6/guilds/${config.discord.ids.serverId}/members?limit=1000&after=${after}`,
      { headers: { authorization: `Bot ${config.discord.botToken}` } }
    ).then(r => r.json())

    users.concat(res)
    halt = res.length !== 1000
    if (!halt) {
      after = res[res.length - 1].id
    }
  }
  return users
}

function fetchMember (memberId) {
  return fetch(`https://discord.com/api/v6/guilds/${config.discord.ids.serverId}/members/${memberId}`, {
    headers: { authorization: `Bot ${config.discord.botToken}` }
  }).then(r => r.json())
}

function setRoles (memberId, roleIds, auditLogReason) {
  const headers = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) {
    headers['X-Audit-Log-Reason'] = auditLogReason
  }
  return fetch(`https://discord.com/api/v6/guilds/${config.discord.ids.serverId}/members/${memberId}`, {
    headers,
    method: 'PATCH',
    body: JSON.stringify({ roles: roleIds })
  })
}

function addRole (memberId, roleId, auditLogReason) {
  const headers = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) {
    headers['X-Audit-Log-Reason'] = auditLogReason
  }
  return fetch(`https://discord.com/api/v6/guilds/${config.discord.ids.serverId}/members/${memberId}/roles/${roleId}`, {
    headers,
    method: 'PUT'
  })
}

function removeRole (memberId, roleId, auditLogReason) {
  const headers = { authorization: `Bot ${config.discord.botToken}`, 'content-type': 'application/json' }
  if (auditLogReason) {
    headers['X-Audit-Log-Reason'] = auditLogReason
  }
  return fetch(`https://discord.com/api/v6/guilds/${config.discord.ids.serverId}/members/${memberId}/roles/${roleId}`, {
    headers,
    method: 'DELETE'
  })
}

module.exports = {
  fetchUser,
  fetchCurrentUser,
  dispatchHonk,
  fetchAllMembers,
  fetchMember,
  setRoles,
  addRole,
  removeRole
}
