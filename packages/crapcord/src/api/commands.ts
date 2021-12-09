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

import type {
  RESTPostAPIApplicationCommandsJSONBody as CreatePayload,
  RESTPostAPIApplicationCommandsResult as CreateResponse,
  RESTPatchAPIApplicationCommandJSONBody as UpdatePayload,
  RESTPatchAPIApplicationCommandResult as UpdateResponse,
  RESTPutAPIApplicationCommandsJSONBody as PushPayload,
  RESTPutAPIApplicationCommandsResult as PushResponse,
} from 'discord-api-types/v9'
import type { DiscordToken } from './common.js'
import { executeQuery } from './common.js'
import { API_BASE } from '../constants.js'

async function _fetchCommands (guildId: string | null, applicationId: string, token: DiscordToken): Promise<CreateResponse> {
  const endpoint = `${API_BASE}/applications/${applicationId}${guildId ? `guilds/${guildId}` : ''}/commands`
  return executeQuery({
    method: 'GET',
    url: endpoint,
    headers: { authorization: `${token.type} ${token.token}` },
  })
}

async function _createCommand (command: CreatePayload, guildId: string | null, applicationId: string, token: DiscordToken): Promise<CreateResponse> {
  const endpoint = `${API_BASE}/applications/${applicationId}${guildId ? `guilds/${guildId}` : ''}/commands`
  return executeQuery({
    method: 'POST',
    url: endpoint,
    headers: { authorization: `${token.type} ${token.token}` },
    body: command,
  })
}

async function _updateCommand (commandId: string, command: UpdatePayload, guildId: string | null, applicationId: string, token: DiscordToken): Promise<UpdateResponse> {
  const endpoint = `${API_BASE}/applications/${applicationId}${guildId ? `guilds/${guildId}` : ''}/commands/${commandId}`
  return executeQuery({
    method: 'POST',
    url: endpoint,
    headers: { authorization: `${token.type} ${token.token}` },
    body: command,
  })
}

async function _deleteCommand (commandId: string, guildId: string | null, applicationId: string, token: DiscordToken): Promise<void> {
  const endpoint = `${API_BASE}/applications/${applicationId}${guildId ? `guilds/${guildId}` : ''}/commands/${commandId}`
  return executeQuery({
    method: 'DELETE',
    url: endpoint,
    headers: { authorization: `${token.type} ${token.token}` },
  })
}

async function _pushCommands (commands: PushPayload, guildId: string | null, applicationId: string, token: DiscordToken): Promise<PushResponse> {
  const endpoint = `${API_BASE}/applications/${applicationId}${guildId ? `guilds/${guildId}` : ''}/commands`
  return executeQuery({
    method: 'PUT',
    url: endpoint,
    headers: { authorization: `${token.type} ${token.token}` },
    body: commands,
  })
}

export function fetchCommand (applicationId: string, token: DiscordToken) {
  return _fetchCommands(null, applicationId, token)
}

export function createCommand (command: CreatePayload, applicationId: string, token: DiscordToken) {
  return _createCommand(command, null, applicationId, token)
}

export function updateCommand (commandId: string, command: UpdatePayload, applicationId: string, token: DiscordToken) {
  return _updateCommand(commandId, command, null, applicationId, token)
}

export function deleteCommand (commandId: string, applicationId: string, token: DiscordToken) {
  return _deleteCommand(commandId, null, applicationId, token)
}

export function fetchGuildCommand (guildId: string, applicationId: string, token: DiscordToken) {
  return _fetchCommands(guildId, applicationId, token)
}

export function createGuildCommand (guildId: string, command: CreatePayload, applicationId: string, token: DiscordToken) {
  return _createCommand(command, guildId, applicationId, token)
}

export function updateGuildCommand (guildId: string, commandId: string, command: UpdatePayload, applicationId: string, token: DiscordToken) {
  return _updateCommand(commandId, command, guildId, applicationId, token)
}

export function deleteGuildCommand (guildId: string, commandId: string, applicationId: string, token: DiscordToken) {
  return _deleteCommand(commandId, guildId, applicationId, token)
}

export async function pushCommands (commands: PushPayload, applicationId: string, token: DiscordToken) {
  return _pushCommands(commands, null, applicationId, token)
}

export async function pushGuildCommands (guildId: string, commands: PushPayload, applicationId: string, token: DiscordToken) {
  return _pushCommands(commands, guildId, applicationId, token)
}
