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

import type { CommandHandler, ComponentHandler } from './interaction.js'

export const commandsRegistry = new Map<string, CommandHandler>()
export const componentsRegistry = new Map<string, ComponentHandler>()

export function registerCommand (command: string, handler: CommandHandler) {
  commandsRegistry.set(command, handler)
}

export function registerCommands (commands: Record<string, CommandHandler>) {
  commandsRegistry.clear()
  for (const command in commands) {
    if (command in commands) {
      registerCommand(command, commands[command])
    }
  }
}

export function unregisterCommand (command: string) {
  commandsRegistry.delete(command)
}

export function clearCommands () {
  commandsRegistry.clear()
}


export function registerComponent (component: string, handler: ComponentHandler) {
  componentsRegistry.set(component, handler)
}

export function registerComponents (components: Record<string, ComponentHandler>) {
  componentsRegistry.clear()
  for (const component in components) {
    if (component in components) {
      registerComponent(component, components[component])
    }
  }
}

export function unregisterComponent (component: string) {
  componentsRegistry.delete(component)
}

export function clearComponents () {
  componentsRegistry.clear()
}
