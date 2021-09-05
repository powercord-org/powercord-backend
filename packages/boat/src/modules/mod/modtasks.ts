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

import type { CommandClient, Guild, User } from 'eris'
import type { InsertOneResult, ObjectId } from 'mongodb'
import cron from 'node-cron'
import { unmute, unban, shouldNotLog } from '../../mod.js'
import { exitRaidMode } from '../../raidMode.js'

export type Schedulable = 'unmute' | 'unban' | 'endRaid'
type Scheduled = { _id: ObjectId, type: Schedulable, guild: string, target: string, mod: string | null, time: number, noLog: boolean }

function processTasks (bot: CommandClient) {
  const collection = bot.mongo.collection<Scheduled>('tasks')
  collection.find().forEach((task) => {
    if (task.time < Date.now()) {
      const guild = bot.guilds.get(task.guild)! // Should never be null in theory; need to check that
      const mod = task.mod ? bot.users.get(task.mod) || null : null
      const suffix = task.noLog ? ' [no log]' : ''

      switch (task.type) {
        case 'unmute':
          unmute(guild, task.target, mod, `Automatically unmuted${suffix}`)
          break
        case 'unban':
          unban(guild, task.target, mod, `Automatically unbanned${suffix}`)
          break
        case 'endRaid':
          exitRaidMode(guild, mod)
          break
      }

      bot.mongo.collection('tasks').deleteOne({ _id: task._id })
    }
  })
}

/**
 * Schedule a task
 * @param task - the task type
 * @param guild - the guild the task will be operating in
 * @param userId - the user the task will be operated on
 * @param mod - the moderator scheduling the task
 * @param time - how long in ms until the task runs
 */
export async function schedule (task: Schedulable, guild: Guild, userId: string, mod: User | null, time: number): Promise<InsertOneResult<Scheduled>> {
  return guild._client.mongo.collection<Scheduled>('tasks').insertOne({
    type: task,
    guild: guild.id,
    target: userId,
    mod: mod?.id || null,
    time: Date.now() + time,
    noLog: shouldNotLog(time),
  })
}

export default function (bot: CommandClient) {
  cron.schedule('* * * * *', () => processTasks(bot))
}
