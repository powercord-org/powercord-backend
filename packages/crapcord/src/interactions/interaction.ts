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
import type { DiscordToken } from '../api/internal/common.js'
import type { InteractionCredentials } from '../api/interactions.js'
import type { CamelCase } from '../util/case.js'
import { ApplicationCommandOptionType, InteractionType, InteractionResponseType } from 'discord-api-types/v9'
import { createMessage, updateMessage, deleteMessage } from '../api/interactions.js'
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
  invoker: User
  channelId: string
  guildId: string | null

  applicationId: string
  applicationToken: DiscordToken

  defer (ephemeral?: boolean): void
  createMessage (message: InteractionMessage, ephemeral?: boolean): Promise<Message> | void
  updateMessage (messageId: string, message: InteractionMessage): Promise<Message> | void
  deleteMessage (messageId: string): Promise<void>
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
  type: 1
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

  invoker: User

  guildId: string | null

  channelId: string

  applicationId: string

  applicationToken: DiscordToken

  #isComponent: boolean

  #processing: boolean = true

  #deferState: DeferState = DeferState.NONE

  #credentials: InteractionCredentials

  #sendResponse: SendResponseFunction

  constructor (payload: ApiInteraction, token: DiscordToken, sendResponse: SendResponseFunction) {
    this.invoker = toCamelCase(payload.member?.user ?? payload.user!)
    this.guildId = payload.guild_id ?? null
    this.channelId = payload.channel_id

    this.applicationId = payload.application_id
    this.applicationToken = token

    this.#isComponent = payload.type === InteractionType.MessageComponent
    this.#credentials = { applicationId: payload.application_id, interactionToken: payload.token }
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
      return this.updateMessage('@original', message)
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
      return // Only case where the message is not returned. Kinda annoying as it makes the return voidable :shrug:
    }

    return createMessage(this.#credentials, message, this.applicationToken)
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
      return // Only case where the message is not returned. Kinda annoying as it makes the return voidable :shrug:
    }

    return updateMessage(this.#credentials, messageId, message, this.applicationToken)
  }

  deleteMessage (messageId: string) {
    if (this.#processing) {
      throw new Error('unexpected call to deleteMessage before initial processing has been completed')
    }

    return deleteMessage(this.#credentials, messageId, this.applicationToken)
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
