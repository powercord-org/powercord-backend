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

const crypto = require('crypto')
const discord = require('../utils/discord')
const config = require('../../config.json')

const TIERS = Object.freeze([ 0, 1, 5, 10 ])
const TIER_EMOJIS = Object.freeze([
  '<a:crii:530146779396833290>',
  '<:blobkiss:723562862840119412>',
  '<:blobsmilehearts:723562904950931584>',
  '<:blobhug:723562944964591706>'
])
const ACTION_TYPES = Object.freeze([
  'members:pledge:create',
  'members:pledge:update',
  'members:pledge:delete'
])

async function patreon (request, reply) {
  if (!ACTION_TYPES.includes(request.headers['x-patreon-event'])) {
    return reply.send()
  }

  const signature = crypto.createHmac('md5', config.honks.patreonSecret).update(request.rawBody).digest('hex')
  if (signature !== request.headers['x-patreon-signature']) {
    return reply.code(401).send()
  }

  let discordUser
  let banned = false
  const pledged = request.body.data.attributes.currently_entitled_amount_cents / 100
  const user = request.body.included.find(resource => resource.type === 'user').attributes
  const discordId = user.social_connections.discord && user.social_connections.discord.user_id
  const tier = TIERS.reverse().findIndex(t => t < pledged)

  if (discordId) {
    discordUser = await discord.fetchUser(discordId)
    const banStatus = await this.mongo.db.collection('banned').findOne({ _id: discordId })
    if (banStatus && banStatus.pledging) {
      banned = true
    } else {
      await this.mongo.db.collection('users').updateOne({ _id: discordId }, { $set: { patreonTier: tier } })
      if (tier === 0) {
        try {
          await discord.removeRole(discordId, config.discord.ids.rolePatreonDaddy)
          await discord.removeRole(discordId, config.discord.ids.rolePatreonMommy)
        } catch (e) {
          // Let the request silently fail; Probably unknown member
          // todo: analyze the error? schedule retrying?
        }
      }
    }
  }

  discord.dispatchHook(config.honks.staff, {
    embeds: [ {
      title: `Pledge ${request.headers['x-patreon-event'].split(':').pop()}d`,
      color: 0x7289da,
      timestamp: new Date(),
      fields: [
        {
          name: 'Tier',
          value: `$${TIERS[tier]} ${TIER_EMOJIS[tier]} ($${pledged.toFixed(2)})`
        },
        {
          name: 'Discord User',
          value: discordUser
            ? `${discordUser.username}#${discordUser.discriminator} (<@${discordUser.id}>)`
            : 'Unknown (Account not linked on Patreon)'
        },
        banned && {
          name: 'Pledge Banned',
          value: 'This user has been previously banned from receiving perks and did not receive them.'
        }
      ].filter(Boolean)
    } ]
  })
  reply.send()
}

module.exports = async function (fastify) {
  fastify.post('/patreon', { config: { rawBody: true } }, patreon)
}
