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

import type { APIInteraction, APIInteractionResponse } from 'discord-api-types/v9'
import { InteractionType } from 'discord-api-types/v9'
import { verify } from 'crypto'

import { commandsRegistry, componentsRegistry } from './registry.js'

export interface ErrorResponse {
  code: number
  message: string
}

type Response = APIInteractionResponse | ErrorResponse

function handleInteraction (interaction: APIGuildInteraction): Promise<Response> {
  return new Promise((resolve) => {
    // todo: grab handler, and pass the interaction
  })
}

export function handlePayload (payload: string, signature: string, timestamp: string, key: string, parsed?: APIInteraction): Promise<Response> | Response {
  if (!verify(null, Buffer.from(timestamp + payload, 'utf8'), Buffer.from(key, 'hex'), Buffer.from(signature, 'hex'))) {
    return { code: 401, message: 'invalid request signature' }
  }

  const interaction: APIInteraction = parsed ? parsed : JSON.parse(payload)
  switch (interaction.type) {
    case InteractionType.Ping:
      return { type: 1 }

    case InteractionType.ApplicationCommand:
    case InteractionType.MessageComponent:
      return handleInteraction(interaction)

    case InteractionType.ApplicationCommandAutocomplete:
      return { code: 501, message: 'not implemented' }

    default:
      return { code: 400, message: 'invalid interaction type' }
  }
}
