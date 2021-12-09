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
  RESTPostAPIInteractionCallbackJSONBody as InteractionResponse,
  APIInteractionResponseCallbackData as InteractionMessage,
  APIApplicationCommandInteraction, APIGuildMember,
  APIMessage, APIMessageComponentInteraction, APIUser,
} from 'discord-api-types/v9'
import type { DiscordToken } from '../api/common.js'
import type { Webhook } from '../api/webhooks.js'
import { InteractionType, InteractionResponseType } from 'discord-api-types/v9'
import { createMessage, updateMessage, deleteMessage } from '../api/webhooks.js'

type GuildData = { id: string, member: APIGuildMember }

export interface Interaction {
  type: number
  user: APIUser
  channelId: string
  guild?: GuildData

  defer (): void
  createMessage (message: any): void
  updateMessage (messageId: string, message: any): void
}

export interface CommandInteraction extends Interaction {
  command: string
}

export interface ComponentInteraction extends Interaction {
  id: string
  message: APIMessage

  deferUpdate (): void
}


export interface SlashCommand extends CommandInteraction {
  type: 1
  args: Record<string, any>
}

export interface UserCommand extends CommandInteraction {
  type: 2
  target: {
    user: APIUser,
    member?: APIGuildMember
  }
}

export interface MessageCommand extends CommandInteraction {
  type: 3
  target: APIMessage
}


export interface ButtonComponent extends ComponentInteraction {
  type: 2
}

export interface SelectMenuComponent extends ComponentInteraction {
  type: 3
  values: string[]
}


export type CommandHandler = (interaction: CommandInteraction) => void
export type ComponentHandler = (interaction: ComponentInteraction) => void

type DiscordInteraction = APIApplicationCommandInteraction | APIMessageComponentInteraction

type SendResponseFunction = (payload: InteractionResponse, interactionId: string, interactionToken: string, token: DiscordToken) => void

enum DeferState { NONE, CREATE, UPDATE }

abstract class InteractionImpl implements Interaction {
  abstract type: number

  user: APIUser

  channelId: string

  guild?: GuildData

  #isComponent: boolean

  #processing: boolean = true

  #deferState: DeferState = DeferState.NONE

  #credentials: Webhook & { interaction: string }

  #token: DiscordToken

  #sendResponse: SendResponseFunction

  constructor (payload: DiscordInteraction, token: DiscordToken, sendResponse: SendResponseFunction) {
    this.user = payload.member?.user ?? payload.user!
    this.channelId = payload.channel_id

    this.#isComponent = payload.type === InteractionType.MessageComponent
    this.#credentials = {
      interaction: payload.id,
      id: payload.application_id,
      token: payload.token,
    }
    this.#token = token
    this.#sendResponse = sendResponse
  }

  defer (ephemeral?: boolean) {
    if (!this.#processing) {
      throw new Error('unexpected call to defer with after initial response has been sent')
    }

    this.#processing = false
    this.#deferState = DeferState.CREATE

    const payload: InteractionResponse = {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: { flags: ephemeral ? 1 << 6 : 0 },
    }

    this.#sendResponse(payload, this.#credentials.id, this.#credentials.token, this.#token)
  }

  deferUpdate () {
    if (!this.#isComponent) {
      throw new Error('invalid call to deferUpdate for non component-based interaction')
    }

    if (!this.#processing) {
      throw new Error('unexpected call to deferUpdate with after initial response has been sent')
    }

    this.#processing = false
    this.#deferState = DeferState.UPDATE

    const payload: InteractionResponse = { type: InteractionResponseType.DeferredMessageUpdate }
    this.#sendResponse(payload, this.#credentials.id, this.#credentials.token, this.#token)
  }

  createMessage (message: InteractionMessage, ephemeral?: boolean) {
    if (this.#deferState === DeferState.CREATE) {
      // opinionated choice: after deferring, consider creating a message
      // the logical operation when done processing
      this.updateMessage('@original', message)
      return
    }

    if (ephemeral) { // Helper
      message.flags ??= 0
      message.flags |= 1 << 6
    }

    if (this.#processing) {
      this.#processing = false
      const payload: InteractionResponse = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: message,
      }

      this.#sendResponse(payload, this.#credentials.id, this.#credentials.token, this.#token)
      return
    }

    return createMessage(message, this.#credentials, this.#token)
  }

  updateMessage (messageId: string, message: InteractionMessage) {
    this.#deferState = DeferState.NONE
    if (this.#processing && !this.#isComponent) {
      throw new Error('unexpected call to updateMessage during initial process for a non-component interaction')
    }

    if (this.#processing) {
      this.#processing = false
      const payload: InteractionResponse = {
        type: InteractionResponseType.UpdateMessage,
        data: message,
      }

      this.#sendResponse(payload, this.#credentials.id, this.#credentials.token, this.#token)
      return
    }

    // @ts-expect-error -- See https://github.com/discordjs/discord-api-types/pull/263
    updateMessage(messageId, message, this.#credentials, this.#token)
  }

  deleteMessage (messageId: string) {
    if (this.#processing) {
      throw new Error('unexpected call to deleteMessage before initial processing has been completed')
    }

    return deleteMessage(messageId, this.#credentials, this.#token)
  }
}

export class CommandInteractionImpl extends InteractionImpl implements CommandInteraction {
  type: number

  command: string

  constructor (payload: APIApplicationCommandInteraction, token: DiscordToken, sendResponse: SendResponseFunction) {
    super(payload, token, sendResponse)
    this.type = payload.data.type
    this.command = payload.data.name
  }
}

export class ComponentInteractionImpl extends InteractionImpl implements ComponentInteraction {
  type: number

  id: string

  message: APIMessage

  values?: string[]

  constructor (payload: APIMessageComponentInteraction, token: DiscordToken, sendResponse: SendResponseFunction) {
    super(payload, token, sendResponse)
    this.type = payload.data.component_type
    this.id = payload.data.custom_id
    this.message = payload.message

    if (payload.data.component_type === 3) {
      this.values = payload.data.values
    }
  }
}
