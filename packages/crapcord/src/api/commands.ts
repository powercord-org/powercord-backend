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
  RESTPostAPIApplicationCommandsJSONBody as CreatePayloadSneak,
  RESTPostAPIApplicationCommandsResult as CreateResponseSneak,
  RESTPatchAPIApplicationCommandJSONBody as UpdatePayloadSneak,
  RESTPatchAPIApplicationCommandResult as UpdateResponseSneak,
  RESTPutAPIApplicationCommandsJSONBody as PushPayloadSneak,
  RESTPutAPIApplicationCommandsResult as PushResponseSneak,
} from 'discord-api-types/v9'
import type { DiscordToken } from './internal/common.js'
import type { CamelCase } from '../util/case.js'
import { route, executeQuery } from './internal/common.js'

type CreatePayload = CamelCase<CreatePayloadSneak>
type CreateResponse = CamelCase<CreateResponseSneak>
type UpdatePayload = CamelCase<UpdatePayloadSneak>
type UpdateResponse = CamelCase<UpdateResponseSneak>
type PushPayload = CamelCase<PushPayloadSneak>
type PushResponse = CamelCase<PushResponseSneak>

const FETCH_COMMANDS = route`${'GET'}/applications/${'applicationId'}/commands`
const PUSH_COMMANDS = route`${'PUT'}/applications/${'applicationId'}/commands`
const CREATE_COMMAND = route`${'POST'}/applications/${'applicationId'}/commands`
const UPDATE_COMMAND = route`${'PATCH'}/applications/${'applicationId'}/commands/${'commandId'}`
const DELETE_COMMAND = route`${'DELETE'}/applications/${'applicationId'}/commands/${'commandId'}`

const FETCH_GUILD_COMMANDS = route`${'GET'}/applications/${'applicationId'}/guilds/${'guildId'}/commands`
const PUSH_GUILD_COMMANDS = route`${'PUT'}/applications/${'applicationId'}/guilds/${'guildId'}/commands`
const CREATE_GUILD_COMMAND = route`${'POST'}/applications/${'applicationId'}/guilds/${'guildId'}/commands`
const UPDATE_GUILD_COMMAND = route`${'PATCH'}/applications/${'applicationId'}/guilds/${'guildId'}/commands/${'commandId'}`
const DELETE_GUILD_COMMAND = route`${'DELETE'}/applications/${'applicationId'}/guilds/${'guildId'}/commands/${'commandId'}`

async function _fetchCommands (guildId: string | null, applicationId: string, token: DiscordToken): Promise<CreateResponse> {
  const endpoint = guildId
    ? FETCH_GUILD_COMMANDS({ applicationId: applicationId, guildId: guildId })
    : FETCH_COMMANDS({ applicationId: applicationId })

  return executeQuery({ route: endpoint, token: token })
}

async function _createCommand (command: CreatePayload, guildId: string | null, applicationId: string, token: DiscordToken): Promise<CreateResponse> {
  const endpoint = guildId
    ? CREATE_GUILD_COMMAND({ applicationId: applicationId, guildId: guildId })
    : CREATE_COMMAND({ applicationId: applicationId })

  return executeQuery({ route: endpoint, token: token, body: command })
}

async function _updateCommand (commandId: string, command: UpdatePayload, guildId: string | null, applicationId: string, token: DiscordToken): Promise<UpdateResponse> {
  const endpoint = guildId
    ? UPDATE_GUILD_COMMAND({ applicationId: applicationId, guildId: guildId, commandId: commandId })
    : UPDATE_COMMAND({ applicationId: applicationId, commandId: commandId })

  return executeQuery({ route: endpoint, token: token, body: command })
}

async function _deleteCommand (commandId: string, guildId: string | null, applicationId: string, token: DiscordToken): Promise<void> {
  const endpoint = guildId
    ? DELETE_GUILD_COMMAND({ applicationId: applicationId, guildId: guildId, commandId: commandId })
    : DELETE_COMMAND({ applicationId: applicationId, commandId: commandId })

  return executeQuery({ route: endpoint, token: token })
}

async function _pushCommands (commands: PushPayload, guildId: string | null, applicationId: string, token: DiscordToken): Promise<PushResponse> {
  const endpoint = guildId
    ? PUSH_GUILD_COMMANDS({ applicationId: applicationId, guildId: guildId })
    : PUSH_COMMANDS({ applicationId: applicationId })

  return executeQuery({ route: endpoint, token: token, body: commands })
}

/// API Functions

// Get Global Application Commands
export function fetchCommands (applicationId: string, token: DiscordToken) {
  return _fetchCommands(null, applicationId, token)
}

// Create Global Application Command
export function createCommand (command: CreatePayload, applicationId: string, token: DiscordToken) {
  return _createCommand(command, null, applicationId, token)
}

// todo: Get Global Application Command

// Edit Global Application Command
export function updateCommand (commandId: string, command: UpdatePayload, applicationId: string, token: DiscordToken) {
  return _updateCommand(commandId, command, null, applicationId, token)
}

// Delete Global Application Command
export function deleteCommand (commandId: string, applicationId: string, token: DiscordToken) {
  return _deleteCommand(commandId, null, applicationId, token)
}

// Bulk Overwrite Global Application Commands
export async function pushCommands (commands: PushPayload, applicationId: string, token: DiscordToken) {
  return _pushCommands(commands, null, applicationId, token)
}

// Get Guild Application Commands
export function fetchGuildCommands (guildId: string, applicationId: string, token: DiscordToken) {
  return _fetchCommands(guildId, applicationId, token)
}

// Create Guild Application Command
export function createGuildCommand (guildId: string, command: CreatePayload, applicationId: string, token: DiscordToken) {
  return _createCommand(command, guildId, applicationId, token)
}

// todo: Get Guild Application Command

// Edit Guild Application Command
export function updateGuildCommand (guildId: string, commandId: string, command: UpdatePayload, applicationId: string, token: DiscordToken) {
  return _updateCommand(commandId, command, guildId, applicationId, token)
}

// Delete Guild Application Command
export function deleteGuildCommand (guildId: string, commandId: string, applicationId: string, token: DiscordToken) {
  return _deleteCommand(commandId, guildId, applicationId, token)
}

// Bulk Overwrite Guild Application Commands
export async function pushGuildCommands (guildId: string, commands: PushPayload, applicationId: string, token: DiscordToken) {
  return _pushCommands(commands, guildId, applicationId, token)
}

// todo: Get Guild Application Command Permissions

// todo: Get Application Command Permissions

// todo: Edit Application Command Permissions

// todo: Batch Edit Application Command Permissions
