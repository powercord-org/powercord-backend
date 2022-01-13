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

import type { DiscordToken } from './api/internal/common.js'

import * as channels from './api/channels.js'
import * as commands from './api/commands.js'
import * as emojis from './api/emojis.js'
import * as guilds from './api/guilds.js'
import * as interactions from './api/interactions.js'
import * as invites from './api/invites.js'
import * as members from './api/members.js'
import * as messages from './api/messages.js'
import * as misc from './api/misc.js'
import * as oauth from './api/oauth.js'
import * as roles from './api/roles.js'
import * as scheduledEvents from './api/scheduledEvents.js'
import * as stages from './api/stages.js'
import * as stickers from './api/stickers.js'
import * as templates from './api/templates.js'
import * as threads from './api/threads.js'
import * as user from './api/user.js'
import * as webhooks from './api/webhooks.js'

export { DiscordToken, DiscordError } from './api/internal/common.js'

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

export {
  channels,
  commands,
  emojis,
  guilds,
  interactions,
  invites,
  members,
  messages,
  misc,
  oauth,
  roles,
  scheduledEvents,
  stages,
  stickers,
  templates,
  threads,
  user,
  webhooks,
}

export function withToken (token: DiscordToken) {
  return {
    channels: endpointsWithToken(channels, token),
    commands: endpointsWithToken(commands, token),
    emojis: endpointsWithToken(emojis, token),
    guilds: endpointsWithToken(guilds, token),
    interactions: endpointsWithToken(interactions, token),
    invites: endpointsWithToken(invites, token),
    members: endpointsWithToken(members, token),
    messages: endpointsWithToken(messages, token),
    misc: endpointsWithToken(misc, token),
    roles: endpointsWithToken(roles, token),
    scheduledEvents: endpointsWithToken(scheduledEvents, token),
    stages: endpointsWithToken(stages, token),
    stickers: endpointsWithToken(stickers, token),
    templates: endpointsWithToken(templates, token),
    threads: endpointsWithToken(threads, token),
    user: endpointsWithToken(user, token),
  }
}
