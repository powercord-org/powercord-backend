import type { FastifyInstance } from 'fastify'

export const user = {
  $id: 'https://powercord.dev/schemas/user',
  $schema: 'http://json-schema.org/draft-07/schema#', // todo: draft/2020-12 when fst4 & ajv8

  type: 'object',
  additionalProperties: false,
  required: [ '_id', 'username', 'discriminator', 'avatar' ],
  properties: {
    _id: { type: 'string' },
    username: { type: 'string' },
    discriminator: { type: 'string' },
    avatar: { type: [ 'null', 'string' ] },
    flags: { type: 'number' },

    accounts: {
      type: 'object',
      properties: {
        spotify: { type: 'string' },
        patreon: { type: 'string' },
      },
    },

    cutieStatus: {
      type: 'object',
      additionalProperties: false,
      required: [ 'perksExpireAt' ],
      properties: {
        pledgeTier: { type: 'number' },
        perksExpireAt: { type: 'number' },
      },
    },
    cutiePerks: { // todo: define how to handle guild badges perk
      type: 'object',
      additionalProperties: false,
      required: [ 'color', 'badge', 'title' ],
      properties: {
        color: { type: [ 'null', 'string' ], pattern: '^[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$' },
        badge: { type: [ 'null', 'string' ], minLength: 8, maxLength: 128 },
        title: { type: [ 'null', 'string' ], minLength: 2, maxLength: 32 },
      },
    },

    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
}

export const userUpdate = {
  $id: 'https://powercord.dev/schemas/user/update',
  $schema: 'http://json-schema.org/draft-07/schema#', // todo: draft/2020-12 when fst4 & ajv8

  type: 'object',
  additionalProperties: false,
  properties: { cutiePerks: { $ref: '/schemas/user#/properties/cutiePerks' } },
}

export function load (fastify: FastifyInstance) {
  fastify.addSchema(user)
  fastify.addSchema(userUpdate)
}
