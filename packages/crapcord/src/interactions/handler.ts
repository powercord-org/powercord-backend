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

import type { APIApplicationCommandInteraction, APIInteraction, APIInteractionResponse, APIMessageComponentInteraction } from 'discord-api-types/v9'
import type { DiscordToken } from '../api/common.js'
import { InteractionType } from 'discord-api-types/v9'
import { verify } from 'crypto'

import { CommandInteractionImpl, ComponentInteractionImpl } from './interaction.js'
import { commandsRegistry, componentsRegistry } from './registry.js'

export interface ErrorResponse {
  code: number
  message: string
}

type Response = APIInteractionResponse | ErrorResponse

function handleCommand (payload: APIApplicationCommandInteraction, token: DiscordToken): Promise<Response> | Response {
  const handler = commandsRegistry.get(payload.data.name)
  if (!handler) return { code: 400, message: 'unknown interaction' }

  return new Promise<Response>((resolve) => {
    const timeout = setTimeout(() => {
      console.error('Warning: an interaction took more than 3 seconds to send a response and timed out.')
      resolve({ code: 500, message: 'internal server error' })
      resolve = () => void 0
    }, 3e3)

    function sendResponse (res: APIInteractionResponse) {
      clearTimeout(timeout)
      resolve(res)
    }

    try {
      const interaction = new CommandInteractionImpl(payload, token, sendResponse)
      handler(interaction)
    } catch (e) {
      clearTimeout(timeout)
      console.error('Unexpected error while handling the interaction', e)
      resolve({ code: 500, message: 'internal server error' })
      resolve = () => void 0
    }
  })
}

function handleComponent (payload: APIMessageComponentInteraction, token: DiscordToken): Promise<Response> | Response {
  const handler = componentsRegistry.get(payload.data.custom_id)
  if (!handler) return { code: 400, message: 'unknown interaction' }

  return new Promise<Response>((resolve) => {
    try {
      const interaction = new ComponentInteractionImpl(payload, token, resolve)
      handler(interaction)
    } catch (e) {
      console.error('Unexpected error while handling the interaction', e)
      resolve({ code: 500, message: 'internal server error' })
    }
  })
}

export function handlePayload (payload: string, signature: string, timestamp: string, key: string, token: DiscordToken, parsed?: APIInteraction): Promise<Response> | Response {
  if (!verify(null, Buffer.from(timestamp + payload, 'utf8'), Buffer.from(key, 'hex'), Buffer.from(signature, 'hex'))) {
    return { code: 401, message: 'invalid request signature' }
  }

  const interaction: APIInteraction = parsed ? parsed : JSON.parse(payload)
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
