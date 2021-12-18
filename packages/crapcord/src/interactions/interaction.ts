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
  APIApplicationCommandInteractionDataOption as InteractionOption,
  APIChatInputApplicationCommandInteractionDataResolved as InteractionResolved,
  APIApplicationCommandInteraction as ApiCommandInteraction,
  APIMessageComponentInteraction as ApiComponentInteraction,
  APIInteractionResponseCallbackData as InteractionMessageSneak,
  APIInteractionDataResolvedGuildMember as ResolvedMemberSneak,
  APIInteractionDataResolvedChannel as ResolvedChannelSneak,
  APIMessage as MessageSneak,
  APIUser as UserSneak,
  APIRole as RoleSneak,
} from 'discord-api-types/v9'
import type { DiscordToken } from '../api/common.js'
import type { Webhook } from '../api/webhooks.js'
import type { CamelCase } from '../util/case.js'
import { ApplicationCommandOptionType, InteractionType, InteractionResponseType } from 'discord-api-types/v9'
import { createMessage, updateMessage, deleteMessage } from '../api/webhooks.js'
import { toCamelCase, toSneakCase } from '../util/case.js'

type InteractionMessage = CamelCase<InteractionMessageSneak>
type ResolvedMember = CamelCase<ResolvedMemberSneak>
type ResolvedChannel = CamelCase<ResolvedChannelSneak>
type Message = CamelCase<MessageSneak>
type User = CamelCase<UserSneak>
type Role = CamelCase<RoleSneak>

type UserData = { user: User, member: ResolvedMember | null }

export type OptionRole = Role
export type OptionChannel = ResolvedChannel
export type OptionUser = { user: User, member: ResolvedMember | null }
export type OptionMentionable = { type: 'role', value: Role } | { type: 'user', value: UserData }
export type OptionValue = string | number | boolean | OptionRole | OptionChannel | OptionUser | OptionMentionable

export interface Interaction {
  type: number
  user: User
  channelId: string

  defer (): void
  createMessage (message: InteractionMessage, ephemeral?: boolean): Promise<Message> | void
  updateMessage (messageId: string, message: InteractionMessage): void
  deleteMessage (messageId: string): void
}

export interface CommandInteraction extends Interaction {
  command: string
  subcommands: string[]
  args: Record<string, any>
}

export interface ComponentInteraction extends Interaction {
  id: string
  message: Message

  deferUpdate (): void
}

export interface SlashCommand<TArgs extends Record<string, OptionValue> = Record<string, OptionValue>> extends CommandInteraction {
  args: TArgs
}

export interface UserCommand extends CommandInteraction {
  type: 2
  args: UserData
}

export interface MessageCommand extends CommandInteraction {
  type: 3
  args: {
    message: Message
  }
}


export interface ButtonComponent extends ComponentInteraction {
  type: 2
}

export interface SelectMenuComponent extends ComponentInteraction {
  type: 3
  values: string[]
}

// this any is gross but I can't do much about it, or at least idk how
export type SlashCommandHandler = (interaction: SlashCommand<any>) => void
export type UserCommandHandler = (interaction: UserCommand) => void
export type MessageCommandHandler = (interaction: MessageCommand) => void
export type CommandHandler = SlashCommandHandler | UserCommandHandler | MessageCommandHandler
export type GenericCommandHandler = (interaction: CommandInteraction) => void

export type ButtonComponentHandler = (interaction: ButtonComponent) => void
export type SelectMenuComponentHandler = (interaction: SelectMenuComponent) => void
export type ComponentHandler = (interaction: ComponentInteraction) => void

export type SendResponseFunction = (response: InteractionResponse) => void

type ApiInteraction = ApiCommandInteraction | ApiComponentInteraction

enum DeferState { NONE, CREATE, UPDATE }

abstract class InteractionImpl implements Interaction {
  abstract type: number

  user: User

  channelId: string

  #isComponent: boolean

  #processing: boolean = true

  #deferState: DeferState = DeferState.NONE

  #credentials: Webhook

  #token: DiscordToken

  #sendResponse: SendResponseFunction

  constructor (payload: ApiInteraction, token: DiscordToken, sendResponse: SendResponseFunction) {
    this.user = toCamelCase(payload.member?.user ?? payload.user!)
    this.channelId = payload.channel_id

    this.#isComponent = payload.type === InteractionType.MessageComponent
    this.#credentials = { id: payload.application_id, token: payload.token }
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

    this.#sendResponse(payload)
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
    this.#sendResponse(payload)
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
        data: toSneakCase(message),
      }

      this.#sendResponse(payload)
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
        data: toSneakCase(message),
      }

      this.#sendResponse(payload)
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

  subcommands: string[]

  args: Record<string, any>

  constructor (payload: ApiCommandInteraction, token: DiscordToken, sendResponse: SendResponseFunction) {
    super(payload, token, sendResponse)
    this.type = payload.data.type
    this.command = payload.data.name
    this.subcommands = []

    switch (payload.data.type) {
      case 1:
        this.args = this.#parseOptions(payload.data.options, payload.data.resolved)
        break
      case 2: {
        const rawMember = payload.data.resolved.members?.[payload.data.target_id]
        this.args = {
          user: toCamelCase(payload.data.resolved.users[payload.data.target_id]),
          member: rawMember ? toCamelCase(rawMember) : null,
        }
        break
      }
      case 3:
        this.args = { message: toCamelCase(payload.data.resolved.messages[payload.data.target_id]) }
        break
      default:
        this.args = {}
        break
    }
  }

  #parseOptions (options?: InteractionOption[], resolved?: InteractionResolved): Record<string, OptionValue> {
    if (!options) return {}

    const parsed: Record<string, OptionValue> = {}
    for (const option of options) {
      if (option.type === ApplicationCommandOptionType.Subcommand || option.type === ApplicationCommandOptionType.SubcommandGroup) {
        this.subcommands.push(option.name)
        return this.#parseOptions(option.options, resolved)
      }

      switch (option.type) {
        case ApplicationCommandOptionType.User:
          parsed[option.name] = {
            user: toCamelCase(resolved?.users?.[option.value]!),
            member: resolved?.members?.[option.value] ? toCamelCase(resolved.members[option.value]) : null,
          }
          break
        case ApplicationCommandOptionType.Channel:
          parsed[option.name] = toCamelCase(resolved?.channels?.[option.value]!)
          break
        case ApplicationCommandOptionType.Role:
          parsed[option.name] = toCamelCase(resolved?.roles?.[option.value]!)
          break
        case ApplicationCommandOptionType.Mentionable:
          if (resolved?.roles?.[option.value]) {
            parsed[option.name] = { type: 'role', value: toCamelCase(resolved.roles[option.value]) }
          } else {
            parsed[option.name] = {
              type: 'user',
              value: {
                user: toCamelCase(resolved?.users?.[option.value]!),
                member: resolved?.members?.[option.value] ? toCamelCase(resolved.members[option.value]) : null,
              },
            }
          }
          break
        default:
          parsed[option.name] = option.value
          break
      }
    }

    return parsed
  }
}

export class ComponentInteractionImpl extends InteractionImpl implements ComponentInteraction {
  type: number

  id: string

  message: Message

  values?: string[]

  constructor (payload: ApiComponentInteraction, token: DiscordToken, sendResponse: SendResponseFunction) {
    super(payload, token, sendResponse)
    this.type = payload.data.component_type
    this.id = payload.data.custom_id
    this.message = toCamelCase(payload.message)

    if (payload.data.component_type === 3) {
      this.values = payload.data.values
    }
  }
}
