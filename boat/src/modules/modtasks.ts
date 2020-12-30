/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

import type { CommandClient, Guild, GuildTextableChannel, Message, User } from 'eris'
import type { InsertOneWriteOpResult, ObjectId } from 'mongodb'
import cron from 'node-cron'
import { unmute, unban } from '../mod.js'

export type Schedulable = 'unmute' | 'unban'
type Scheduled = { _id: ObjectId, type: Schedulable, guild: string, target: string, mod: string, time: number }

function processTasks (bot: CommandClient) {
  const collection = bot.mongo.collection<Scheduled>('tasks')
  collection.find().forEach((task) => {
    if (task.time < Date.now()) {
      const guild = bot.guilds.get(task.guild)! // Should never be null in theory; need to check that
      const mod = bot.users.get(task.mod)! // Should never be null in theory; need to check that

      switch (task.type) {
        case 'unmute':
          unmute(guild, task.target, mod, 'Automatically unmuted')
          break
        case 'unban':
          unban(guild, task.target, mod, 'Automatically unbanned')
          break
      }

      bot.mongo.collection('tasks').deleteOne({ _id: task._id })
    }
  })
}

export async function schedule (task: Schedulable, guild: Guild, userId: string, mod: User, time: number): Promise<InsertOneWriteOpResult<Scheduled>> {
  return mod._client.mongo.collection<Scheduled>('tasks').insertOne({
    type: task,
    guild: guild.id,
    target: userId,
    mod: mod.id,
    time: Date.now() + time
  })
}

export default function (bot: CommandClient) {
  cron.schedule('* * * * *', () => processTasks(bot))
}
