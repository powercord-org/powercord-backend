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

import type { DiscordToken } from './common.js'
import fetch from '../fetch.js'
import { API_BASE } from '../constants.js'
import { DiscordError } from './common.js'

async function _createCommand (command: any, guildId: string | null, token: DiscordToken): Promise<void> {
  // todo
}

async function _updateCommand (commandId: string, command: any, guildId: string | null, token: DiscordToken): Promise<void> {
  // todo
}

async function _deleteCommand (commandId: string, guildId: string | null, token: DiscordToken): Promise<void> {
  // todo
}

export function createCommand (command: any, token: DiscordToken) {
  return _createCommand(command, null, token)
}

export function updateCommand (commandId: string, command: any, token: DiscordToken) {
  return _updateCommand(commandId, command, null, token)
}

export function deleteCommand (commandId: string, token: DiscordToken) {
  return _deleteCommand(commandId, null, token)
}

export function createGuildCommand (guildId: string, command: any, token: DiscordToken) {
  return _createCommand(command, guildId, token)
}

export function updateGuildCommand (guildId: string, commandId: string, command: any, token: DiscordToken) {
  return _updateCommand(commandId, command, guildId, token)
}

export function deleteGuildCommand (guildId: string, commandId: string, token: DiscordToken) {
  return _deleteCommand(commandId, guildId, token)
}

export async function pushCommands (commands: any[], token: DiscordToken): Promise<void> {
  // todo
}

export async function pushGuildCommands (guildId: string, commands: any[], token: DiscordToken): Promise<void> {
  // todo
}
