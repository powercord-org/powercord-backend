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

import { CommandClient, Guild, TextChannel, User } from 'eris'
import { schedule } from './modules/modtasks.js'
import { prettyPrintTimeSpan } from './util.js'
import config from './config.js'

const RAID_LEVEL = 3
const NORMAL_LEVEL = 1

let raidMode: boolean

export function initRaidMode (bot: CommandClient) {
  const guild = bot.guilds.get(config.discord.ids.serverId)
  raidMode = guild?.verificationLevel === RAID_LEVEL
}

/**
 * @returns true if raid mode is active, false otherwise
 */
export function getRaidStatus(): boolean {
  return raidMode
}

/**
 * Raise a guilds verification level for a set amount of time.
 * @param guild - the guild that will have its verification level raised
 * @param mod - the moderator responsible for raising the verification level
 * @param duration - the amount of time in ms the verification level will be raised for
 */
export async function enterRaidMode (guild: Guild, mod: User, duration: number) {
  if (raidMode) return

  await guild.edit({ verificationLevel: RAID_LEVEL })
  schedule('endRaid', guild, '', mod, duration)

  raidMode = true

  const staffChannel = guild.channels.get(config.discord.ids.channelStaff) as TextChannel
  if (staffChannel) {
    staffChannel.createMessage(`Raid mode activated by ${mod.username}#${mod.discriminator}.` +
      ` Raid mode will be ended automatically in ${prettyPrintTimeSpan(duration)}.`)
  }
}

/**
 * Return a guild to the normal verification level.
 * @param guild - the guild to have its verification level lowered
 * @param mod - the moderator responsible for lowering the verification level
 */
export async function exitRaidMode (guild: Guild, mod: User) {
  if (!raidMode) return

  await guild.edit({ verificationLevel: NORMAL_LEVEL })

  guild._client.mongo.collection('tasks').deleteMany({ type: 'endRaid' })

  raidMode = false

  const staffChannel = guild.channels.get(config.discord.ids.channelStaff) as TextChannel
  if (staffChannel) {
    staffChannel.createMessage(`Now exiting raid mode as requested by ${mod.username}#${mod.discriminator}.`)
  }
}
