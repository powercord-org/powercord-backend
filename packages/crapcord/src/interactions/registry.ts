/*
 * Copyright (c) 2022 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { SlashCommandHandler, CommandHandler, ComponentHandler } from './interaction.js'

type BasicHandle = { handler: CommandHandler }
type SlashHandler = { handler: SlashCommandHandler, autocomplete?: never }

type SlashCommandSub = { sub: Record<string, { sub: Record<string, SlashHandler> } | SlashHandler> }
export type CommandEntry = { command: string } & (BasicHandle | SlashHandler | SlashCommandSub)
export type ComponentEntry = { id: string, handler: ComponentHandler }

export const commandsRegistry = new Map<string, CommandEntry>()
export const componentsRegistry = new Map<string, ComponentEntry>()

export function registerCommand (command: CommandEntry) {
  commandsRegistry.set(command.command, command)
}

export function registerCommands (commands: CommandEntry[]) {
  commands.forEach(registerCommand)
}

export function unregisterCommand (command: string) {
  commandsRegistry.delete(command)
}

export function clearCommands () {
  commandsRegistry.clear()
}


export function registerComponent (component: ComponentEntry) {
  componentsRegistry.set(component.id, component)
}

export function registerComponents (components: ComponentEntry[]) {
  components.forEach(registerComponent)
}

export function unregisterComponent (component: string) {
  componentsRegistry.delete(component)
}

export function clearComponents () {
  componentsRegistry.clear()
}
