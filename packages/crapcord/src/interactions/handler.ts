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

import type { APIApplicationCommandInteraction, APIInteraction, APIInteractionResponse, APIMessageComponentInteraction } from 'discord-api-types/v9'
import type { GenericCommandHandler, CommandHandler, SendResponseFunction } from './interaction.js'
import type { CommandEntry } from './registry.js'
import type { DiscordToken } from '../api/internal/common.js'
import { InteractionType, ApplicationCommandType, ComponentType, ApplicationCommandOptionType as OptionType } from 'discord-api-types/v9'
import { webcrypto } from 'crypto'

import { CommandInteractionImpl, ComponentInteractionImpl } from './interaction.js'
import { commandsRegistry, componentsRegistry } from './registry.js'
import { InteractionErrorCode, InteractionError, dispatchError } from './error.js'
import { createResponse } from '../api/interactions.js'
import { makeDeferred } from '../util/deferred.js'

export type ErrorResponse = { code: number, message: string }

type Response = APIInteractionResponse | ErrorResponse

const keyCache = new Map<string, any>()

const Components = {
  [ComponentType.Button]: 'Button',
  [ComponentType.SelectMenu]: 'SelectMenu',
}

function payloadToInvocation (payload: APIApplicationCommandInteraction | APIMessageComponentInteraction) {
  if (payload.type === InteractionType.MessageComponent) {
    return `${Components[payload.data.component_type]} #${payload.data.custom_id}`
  }

  if (payload.data.type === ApplicationCommandType.ChatInput) {
    const opt = payload.data.options?.[0]
    if (opt?.type === OptionType.SubcommandGroup) {
      return `/${payload.data.name} ${opt.name} ${opt.options[0].name}`
    }

    if (opt?.type === OptionType.Subcommand) {
      return `/${payload.data.name} ${opt.name}`
    }

    return `/${payload.data.name}`
  }

  return payload.data.name
}

function routeCommand (command: CommandEntry, payload: APIApplicationCommandInteraction): CommandHandler | null {
  if (payload.data.type === ApplicationCommandType.ChatInput) {
    if ('handler' in command) return command.handler

    let opt = payload.data.options?.[0]
    if (!opt || (opt.type !== OptionType.Subcommand && opt.type !== OptionType.SubcommandGroup)) return null

    if (!(opt.name in command.sub)) return null
    const sub = command.sub[opt.name]

    if ('handler' in sub) return sub.handler
    if (opt.type !== OptionType.SubcommandGroup) return null

    if (!(opt.options[0].name in sub.sub)) return null
    return sub.sub[opt.options[0].name].handler
  }

  return 'handler' in command ? command.handler : null
}

function prepareInteraction (payload: APIApplicationCommandInteraction | APIMessageComponentInteraction): [ Promise<Response>, SendResponseFunction, (err: string) => void ] {
  const deferred = makeDeferred<Response>()

  const timeout = setTimeout(() => {
    const error = new InteractionError(InteractionErrorCode.InvocationTimeout, payloadToInvocation(payload))
    deferred.resolve({ code: 504, message: error.message })
    deferred.resolve = () => void 0
    dispatchError(error)
  }, 3e3)

  return [
    deferred.promise,
    (res: APIInteractionResponse) => {
      clearTimeout(timeout)
      deferred.resolve(res)
    },
    (err: string) => {
      clearTimeout(timeout)
      deferred.resolve({ code: 500, message: err })
      deferred.resolve = () => void 0
    },
  ]
}

function handleCommand (payload: APIApplicationCommandInteraction, token: DiscordToken): Promise<Response> | Response {
  const command = commandsRegistry.get(payload.data.name)
  if (!command) {
    const error = new InteractionError(InteractionErrorCode.InteractionNotFound, payloadToInvocation(payload))
    dispatchError(error)

    return { code: 404, message: error.message }
  }

  // Route subcommands
  const handler = routeCommand(command, payload) as GenericCommandHandler | null
  if (!handler) {
    const error = new InteractionError(InteractionErrorCode.CommandRouteNotFound, payloadToInvocation(payload))
    dispatchError(error)

    return { code: 404, message: error.message }
  }

  const [ promise, sendResponse, onError ] = prepareInteraction(payload)
  const interaction = new CommandInteractionImpl(payload, token, sendResponse)

  try {
    handler(interaction)
  } catch (e: any) {
    const error = new InteractionError(InteractionErrorCode.InvocationException, payloadToInvocation(payload), e)
    dispatchError(error)
    onError(error.message)
  }

  return promise
}

function handleComponent (payload: APIMessageComponentInteraction, token: DiscordToken): Promise<Response> | Response {
  const component = componentsRegistry.get(payload.data.custom_id)
  if (!component) return { code: 400, message: 'unknown interaction' }

  const [ promise, sendResponse, onError ] = prepareInteraction(payload)
  const interaction = new ComponentInteractionImpl(payload, token, sendResponse)

  try {
    component.handler(interaction)
  } catch (e: any) {
    const error = new InteractionError(InteractionErrorCode.InvocationException, payloadToInvocation(payload), e)
    dispatchError(error)
    onError(error.message)
  }

  return promise
}

export async function processPayload (interaction: APIInteraction, token: DiscordToken): Promise<Response> {
  switch (interaction.type) {
    case InteractionType.Ping:
      return { type: 1 }

    case InteractionType.ApplicationCommand:
      return handleCommand(interaction, token)

    case InteractionType.MessageComponent:
      return handleComponent(interaction, token)

    case InteractionType.ApplicationCommandAutocomplete:
      return { code: 501, message: 'not implemented' }

    default:
      return { code: 400, message: 'invalid interaction type' }
  }
}

export async function validateSignature (payload: string, signature: string, timestamp: string, key: string): Promise<boolean> {
  if (!keyCache.has(key)) {
    const keyBuf = Buffer.from(key, 'hex')
    const importedKey = await webcrypto.subtle.importKey(
      'raw',
      keyBuf,
      { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519', public: true },
      false,
      [ 'verify' ]
    )

    keyCache.set(key, importedKey)
  }

  return webcrypto.subtle.verify(
    'NODE-ED25519',
    keyCache.get(key)!,
    Buffer.from(signature, 'hex'),
    Buffer.from(timestamp + payload)
  )
}

export async function handlePayload (payload: string, signature: string, timestamp: string, key: string, token: DiscordToken, parsed?: APIInteraction): Promise<Response> {
  if (!await validateSignature(payload, signature, timestamp, key)) {
    return { code: 401, message: 'invalid request signature' }
  }

  let interaction: APIInteraction
  try {
    // JSON.parse is safe as we know for a fact the data is from Discord - no pollution to worry about here
    interaction = parsed ? parsed : JSON.parse(payload)
  } catch {
    return { code: 400, message: 'malformed request' }
  }

  return processPayload(interaction, token)
}

export async function handleGatewayPayload (interaction: APIInteraction, token: DiscordToken) {
  const res = await processPayload(interaction, token)
  if ('code' in res) return

  return createResponse({ id: interaction.id, token: interaction.token }, res, token)
}
