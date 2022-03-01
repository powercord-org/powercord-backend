/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

export const user = {
  $id: 'https://powercord.dev/schemas/user',
  $schema: 'http://json-schema.org/draft-07/schema#', // todo: draft/2020-12 when fst4 & ajv8

  type: 'object',
  additionalProperties: false,
  required: [ '_id', 'username', 'discriminator', 'avatar', 'accounts', 'cutiePerks' ],
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

export const userBasic = {
  $id: 'https://powercord.dev/schemas/user/basic',
  $schema: 'http://json-schema.org/draft-07/schema#', // todo: draft/2020-12 when fst4 & ajv8

  type: 'object',
  additionalProperties: false,
  required: [ '_id', 'flags', 'cutiePerks' ],
  properties: {
    _id: { $ref: 'https://powercord.dev/schemas/user#/properties/_id' },
    flags: { $ref: 'https://powercord.dev/schemas/user#/properties/flags' },
    cutiePerks: { $ref: 'https://powercord.dev/schemas/user#/properties/cutiePerks' },

    // deprecated api:v2
    id: { type: 'string' },
    username: { const: 'Herobrine' },
    discriminator: { const: '0001' },
    avatar: { const: null },
    badges: {
      type: 'object',
      additionalProperties: false,
      required: [ 'developer', 'staff', 'support', 'contributor', 'translator', 'hunter', 'early', 'custom' ],
      properties: {
        developer: { type: 'boolean' },
        staff: { type: 'boolean' },
        support: { type: 'boolean' },
        contributor: { type: 'boolean' },
        translator: { type: 'boolean' },
        hunter: { type: 'boolean' },
        early: { type: 'boolean' },
        custom: {
          type: 'object',
          additionalProperties: false,
          required: [ 'color', 'icon', 'name' ],
          properties: {
            color: { type: [ 'null', 'string' ] },
            icon: { type: [ 'null', 'string' ] },
            name: { type: [ 'null', 'string' ] },
          },
        },
      },
    },
  },
}

export const userUpdate = {
  $id: 'https://powercord.dev/schemas/user/update',
  $schema: 'http://json-schema.org/draft-07/schema#', // todo: draft/2020-12 when fst4 & ajv8

  type: 'object',
  additionalProperties: false,
  properties: {
    cutiePerks: { $ref: 'https://powercord.dev/schemas/user#/properties/cutiePerks' },
  },
}

export const userUpdateAdmin = {
  $id: 'https://powercord.dev/schemas/admin/user/update',
  $schema: 'http://json-schema.org/draft-07/schema#', // todo: draft/2020-12 when fst4 & ajv8

  type: 'object',
  additionalProperties: false,
  properties: {
    flags: { $ref: 'https://powercord.dev/schemas/user#/properties/flags' },
    cutiePerks: { $ref: 'https://powercord.dev/schemas/user#/properties/cutiePerks' },
    cutieStatus: {
      type: 'object',
      additionalProperties: false,
      properties: {
        pledgeTier: { $ref: 'https://powercord.dev/schemas/user#/properties/cutieStatus/pledgeTier' },
      },
    },
  },
}

export const userSpotify = {
  $id: 'https://powercord.dev/schemas/user/spotify',
  $schema: 'http://json-schema.org/draft-07/schema#', // todo: draft/2020-12 when fst4 & ajv8

  type: 'object',
  additionalProperties: false,
  required: [ 'token' ],
  properties: { token: { type: [ 'string', 'null' ] } },

  if: { properties: { token: { const: null } } },
  then: { properties: { revoked: { enum: [ 'ACCESS_DENIED' ] } } },
}
