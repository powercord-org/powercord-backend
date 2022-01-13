/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

// todo: it seems the api is dogshit and it's best to do it manually - get rid of this?

/*
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import crypto from 'crypto'
import config from '@powercord/shared/config'

import { fetchUser, removeRole, dispatchHonk, addRole } from '../utils/discord.js'

type PatreonHeaders = { 'x-patreon-event': string, 'x-patreon-signature': string }

const TIERS = Object.freeze([ 0, 1, 5, 10 ])
const TIERS_REVERSE = Object.freeze([ 10, 5, 1, 0 ])

const TIER_EMOJIS = Object.freeze([
  '<a:crii:530146779396833290>',
  '<:blobkiss:723562862840119412>',
  '<:blobsmilehearts:723562904950931584>',
  '<:blobhug:723562944964591706>',
])

const ACTION_TYPES = Object.freeze([
  'members:pledge:create',
  'members:pledge:update',
  'members:pledge:delete',
])

async function patreon (this: FastifyInstance, request: FastifyRequest<{ Headers: PatreonHeaders }>, reply: FastifyReply) {
  if (!ACTION_TYPES.includes(request.headers['x-patreon-event'])) {
    return reply.send()
  }

  const signature = crypto.createHmac('md5', config.honks.patreonSecret).update(request.rawBody ?? '').digest('hex')
  if (signature !== request.headers['x-patreon-signature']) {
    return reply.code(401).send()
  }

  let discordUser
  let banned = false
  // @ts-expect-error -- todo: schema & typing
  const pledged = request.body.data.attributes.currently_entitled_amount_cents / 100
  // @ts-expect-error -- todo: schema & typing
  const user = request.body.included.find((resource) => resource.type === 'user').attributes
  const discordId = user.social_connections.discord && user.social_connections.discord.user_id
  const tier = TIERS_REVERSE.findIndex((t) => t < pledged)

  if (discordId) {
    discordUser = await fetchUser(discordId)
    const banStatus = await this.mongo.db!.collection('userbans').findOne({ _id: discordId })
    if (banStatus && banStatus.pledging) {
      banned = true
    } else {
      await this.mongo.db!.collection('users').updateOne({ _id: discordId }, { $set: { patreonTier: tier } })
      try {
        if (tier === 0) {
          await removeRole(discordId, config.discord.ids.roleDonator, 'No longer pledging on Patreon')
        } else {
          await addRole(discordId, config.discord.ids.roleDonator, 'Pledged on Patreon!')
        }
      } catch {
        // Let the request silently fail; Probably unknown member
        // todo: analyze the error? schedule retrying (429)?
      }
    }
  }

  dispatchHonk(config.honks.staffChannel, {
    embeds: [
      {
        title: `Pledge ${request.headers['x-patreon-event'].split(':').pop()}d`,
        color: 0x7289da,
        timestamp: new Date(),
        fields: [
          {
            name: 'Tier',
            value: `$${TIERS[tier]} ${TIER_EMOJIS[tier]} ($${pledged.toFixed(2)})`,
          },
          {
            name: 'Discord User',
            value: discordUser
              ? `${discordUser.username}#${discordUser.discriminator} (<@${discordUser.id}>)`
              : 'Unknown (Account not linked on Patreon)',
          },
          banned && {
            name: 'Pledge Banned',
            value: 'This user has been previously banned from receiving perks and did not receive them.',
          },
        ].filter(Boolean),
      },
    ],
  })
  reply.send()
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/patreon', { config: { rawBody: true } }, patreon)
}
*/

export {}
