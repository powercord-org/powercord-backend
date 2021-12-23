export * from './mod/basics.js'
export * from './mod/enforce.js'
export * from './mod/notes.js'

export const slashPayload = {
  type: 1,
  name: 'mod',
  description: 'Perform a moderation task',
  options: [
    // Basics
    {
      type: 1,
      name: 'ban',
      description: 'Ban a user',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'User to ban',
          required: true,
        },
        {
          type: 3,
          name: 'reason',
          description: 'Reason for the audit log',
          required: false,
        },
        {
          type: 4,
          name: 'delete',
          description: 'Days worth of messages to delete (default 0)',
          minValue: 0,
          maxValue: 7,
          required: false,
        },
        {
          type: 3,
          name: 'duration',
          description: 'Duration of the ban (default permanent)',
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: 'unban',
      description: 'Unban a user',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'User to unban',
          required: true,
        },
        {
          type: 3,
          name: 'reason',
          description: 'Reason for the audit log',
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: 'softban',
      description: 'Soft-bans a user (kicks with message deletion)',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'User to soft-ban',
          required: true,
        },
        {
          type: 4,
          name: 'delete',
          description: 'Days worth of messages to delete (default 1)',
          minValue: 1,
          maxValue: 7,
          required: false,
        },
        {
          type: 3,
          name: 'reason',
          description: 'Reason for the audit log',
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: 'timeout',
      description: 'Timeout a user',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'User to timeout',
          required: true,
        },
        {
          type: 3,
          name: 'duration',
          description: 'Duration of the timeout',
          required: true,
        },
        {
          type: 3,
          name: 'reason',
          description: 'Reason for the audit log',
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: 'editcase',
      description: 'Edit a mod-log case',
      options: [
        {
          type: 4,
          name: 'case',
          description: 'Case to edit',
          minValue: 0,
          required: true,
        },
        {
          type: 3,
          name: 'reason',
          description: 'New reason',
          required: false,
        },
      ],
    },

    // Enforce
    {
      type: 1,
      name: 'enforce',
      description: 'Enforce a rule upon a misbehaving user',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'User to lookup',
          required: true,
        },
        {
          type: 4,
          name: 'rule',
          description: 'Rule to enforce',
          minValue: 0,
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: 'lookup',
      description: 'Lookup moderation data about a user',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'User to lookup',
          required: true,
        },
      ],
    },

    // Notes
    {
      type: 2,
      name: 'notes',
      description: 'Internal moderation notes',
      options: [
        {
          type: 1,
          name: 'list',
          description: 'List notes added to a given user',
          options: [
            {
              type: 6,
              name: 'user',
              description: 'User to list notes from',
              required: true,
            },
          ],
        },
        {
          type: 1,
          name: 'add',
          description: 'Add a note to a user',
          options: [
            {
              type: 6,
              name: 'user',
              description: 'User to add a note to',
              required: true,
            },
            {
              type: 3,
              name: 'note',
              description: 'Note text',
              required: true,
            },
          ],
        },
        {
          type: 1,
          name: 'edit',
          description: 'Edit a note from a user',
          options: [
            {
              type: 6,
              name: 'user',
              description: 'User the note belongs to',
              required: true,
            },
            {
              type: 4,
              name: 'id',
              description: 'Note to edit',
              minValue: 0,
              required: true,
            },
            {
              type: 3,
              name: 'note',
              description: 'New note text',
              required: true,
            },
          ],
        },
        {
          type: 1,
          name: 'remove',
          description: 'Remove a note from a user',
          options: [
            {
              type: 6,
              name: 'user',
              description: 'User to remove a note from',
              required: true,
            },
            {
              type: 4,
              name: 'id',
              description: 'Note to remove',
              minValue: 0,
              required: true,
            },
          ],
        },
      ],
    },
  ],
  defaultPermission: false,
}

export const userPayload = {
  type: 2,
  name: 'soft-ban',
  description: '', // "to avoid breaking changes, we did a stupid design choice. blends well with the rest of the api!"
  defaultPermission: false,
}
