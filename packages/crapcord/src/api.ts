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

import type { DiscordToken } from './api/common.js'

import * as messages from './api/messages.js'
import * as webhooks from './api/webhooks.js'
import * as commands from './api/commands.js'

type ApiHelper = Record<string, (...args: any) => any>

type WithToken<T extends ApiHelper> = {
  [K in keyof T]: (...args: Parameters<T[K]> extends [ ...infer A, any ] ? A : never) => ReturnType<T[K]>
}

function endpointsWithToken<T extends ApiHelper> (endpoints: T, token: DiscordToken): WithToken<T> {
  const mappedEndpoints: Record<string, Function> = {}
  for (const key in endpoints) {
    if (key in endpoints) {
      const fn = endpoints[key]
      mappedEndpoints[key] = (...args: any[]) => fn(...args, token)
    }
  }

  return mappedEndpoints as WithToken<T>
}

export { messages, webhooks, commands }

export function withToken (token: DiscordToken) {
  return {
    messages: endpointsWithToken(messages, token),
    webhooks: endpointsWithToken(webhooks, token),
    commands: endpointsWithToken(commands, token),
  }
}
