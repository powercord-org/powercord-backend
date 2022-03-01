/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { SlashCommand, UserCommand, OptionUser } from 'crapcord/interactions'
import { guilds, members } from 'crapcord/api'
import { PermissionFlagsBits } from 'discord-api-types/v9'

type BanArgs = {
  user: OptionUser
  reason?: string
  delete?: number
  duration?: string
}

type UnbanArgs = {
  user: OptionUser
  reason?: string
}

type SoftbanArgs = {
  user: OptionUser
  reason?: string
  delete?: number
}

type TimeoutArgs = {
  user: OptionUser
  duration: string
  reason?: string
}

type EditCaseArgs = {
  case: number
  reason: string
}

export async function ban (interaction: SlashCommand<BanArgs>) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command only works in servers.' }, true)
    return
  }

  if (interaction.args.user.member) {
    // Permission check
    const permissions = BigInt(interaction.args.user.member.permissions)
    if (permissions & PermissionFlagsBits.ManageMessages) {
      interaction.createMessage({ content: 'Are you sure about that one?' }, true)
      return
    }
  }

  await guilds.createGuildBan(
    interaction.guildId,
    interaction.args.user.user.id,
    interaction.args.delete ?? 0,
    interaction.args.reason || 'No reason given',
    interaction.applicationToken
  )

  if (interaction.args.duration) {
    // todo: schedule unban
  }

  interaction.createMessage({ content: 'User successfully banned.' }, true)
}

export async function unban (interaction: SlashCommand<UnbanArgs>) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command only works in servers.' }, true)
    return
  }

  await guilds.removeGuildBan(
    interaction.guildId,
    interaction.args.user.user.id,
    interaction.args.reason || 'No reason given',
    interaction.applicationToken
  )

  interaction.createMessage({ content: 'User successfully unbanned.' }, true)
}

export async function softban (interaction: SlashCommand<SoftbanArgs> | UserCommand) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command only works in servers.' }, true)
    return
  }

  const isUserCommand = interaction.type === 2

  const member = isUserCommand
    ? interaction.args.member
    : interaction.args.user.member

  const user = isUserCommand
    ? interaction.args.user
    : interaction.args.user.user


  if (member) {
    // Permission check
    const permissions = BigInt(member.permissions)
    if (permissions & PermissionFlagsBits.ManageMessages) {
      interaction.createMessage({ content: 'Are you sure about that one?' }, true)
      return
    }
  }

  const reason = isUserCommand
    ? 'No reason given'
    : interaction.args.reason || 'No reason given'

  await guilds.createGuildBan(
    interaction.guildId,
    user.id,
    interaction.type === 2 ? 1 : interaction.args.delete ?? 1,
    reason,
    interaction.applicationToken
  )

  await guilds.removeGuildBan(
    interaction.guildId,
    user.id,
    reason,
    interaction.applicationToken
  )

  interaction.createMessage({ content: 'User successfully soft-banned.' }, true)
}

export async function timeout (interaction: SlashCommand<TimeoutArgs>) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command only works in servers.' }, true)
    return
  }

  if (!interaction.args.user.member) {
    interaction.createMessage({ content: 'This user is not a server member.' }, true)
    return
  }

  // Permission check
  const permissions = BigInt(interaction.args.user.member.permissions)
  if (permissions & PermissionFlagsBits.ManageMessages) {
    interaction.createMessage({ content: 'Are you sure about that one?' }, true)
    return
  }

  // todo: parse duration string
  const date = new Date(Date.now() + (Number(interaction.args.duration) * 1e3)).toISOString()
  await members.modifyGuildMember(
    interaction.guildId,
    interaction.args.user.user.id,
    { communicationDisabledUntil: date },
    interaction.args.reason,
    interaction.applicationToken
  )

  interaction.createMessage({ content: 'User successfully timed out.' }, true)
}

export function editcase (interaction: SlashCommand<EditCaseArgs>) {
  // todo
  interaction.createMessage({ content: 'Not available yet!' }, true)
}
