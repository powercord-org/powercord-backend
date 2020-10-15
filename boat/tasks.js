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

const { data } = require('autoprefixer')
const config = require('../config.json')
const GUILD = config.discord.ids.serverId

module.exports = {
  EMPTY_TASK_OBJ: {
    type: null,
    target: null,
    mod: null,
    time: null
  },

  mute(bot, userID, moderator, reason = 'No reason specified.') {
    bot.addGuildMemberRole(GUILD, userID, config.discord.ids.roleMuted, `[${moderator}] ${reason}`)
  },

  unmute(bot, userID, moderator, reason = 'No reason specified.') {
    bot.removeGuildMemberRole(GUILD, userID, config.discord.ids.roleMuted, `[${moderator}] ${reason}`)
  },

  kick(bot, userID, moderator, reason = 'No reason specified.') {
    bot.kickGuildMember(GUILD, userID, `[${moderator}] ${reason}`)
  },

  ban(bot, userID, moderator, reason = 'No reason specified.') {
    bot.banGuildMember(GUILD, userID, 0, `[${moderator}] ${reason}`)
  },

  unban(bot, userID, moderator, reason = 'No reason specified.') {
    bot.unbanGuildMember(GUILD, userID, `[${moderator}] ${reason}`)
  },

  async handleSchedule(bot) {
    const tasks = await bot.mongo.collection('tasks').find().toArray()

    tasks.forEach(task => {
      if (task.time < Date.now()) {
        
        switch (task.type) {
          case 'unmute':
            this.unmute(bot, task.target, task.mod, 'Automatically unmuted')
            break
          case 'unban':
            this.unban(bot, task.target, task.mod, 'Automatically unbanned')
            break
        }
        bot.mongo.collection('tasks').deleteOne({_id: task._id})
      }
    })
  }  
}
