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

import type { User } from '@powercord/types/users'
import type { StoreForm } from '@powercord/types/store'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { dispatchHonk, editHonkMessage, fetchHonkMessage, sendDm } from '../../utils/discord.js'
import crudModule from './crud.js'
import config from '../../config.js'

const DmMessages = {
  publish: {
    approved: 'Your submission in the Powercord Store has been approved! You should see it appear in the "Manage my works" tab of the Powercord Store shortly.\n\nIf your submission is a plugin, you will receive an invitation to a repository in the powercord-community organization that will be the new home of your plugin. Make sure to push future updates to this repository!',
    rejected: 'Unfortunately, your submission in the Powercord Store has been rejected for the following reason: $reason.\n\nMake sure your plugin follows the Powercord Guidelines available at <https://powercord.dev/guidelines> and that it is in a functional shape before submitting again.',
  },
  verification: {
    approved: 'Your verification request has been approved! Your plugin now has the verified tickmark in the Store, and you have unlocked the Verified Developer role in our support server.',
    rejected: 'Unfortunately, we rejected your verification request for the following reason: $reason.\n\nWe want verified works to be the best-of-the-best, and we tend to be nitpick-y in our review process. Make sure your work meets the eligibility criteria for verification, and make sure to solve the outlined points before submitting again.',
  },
  hosting: {
    approved: 'Your request for hosting a backend has been approved. A Powercord Developer will get in touch soon to prepare your backend for hosting on our servers.',
    rejected: 'Unfortunately, we rejected your request for hosting a backend for the following reason: $reason.',
  },
}

const updateFormSchema = {
  body: {
    required: [ 'reviewed', 'approved', 'reviewer' ],
    type: 'object',
    additionalProperties: false,
    properties: {
      reviewed: { type: 'boolean' },
      approved: { type: 'boolean' },
      reviewer: { type: 'string', pattern: '^\\d{16,}$' },
      reviewReason: { type: 'string', maxLength: 256 },
    },
    if: { properties: { approved: { const: false } } },
    then: { required: [ 'reviewReason' ] },
  },
}

async function getFormCount (this: FastifyInstance) {
  const res: Record<string, number> = {
    verification: 0,
    publish: 0,
    hosting: 0,
    reports: 0,
  }

  const forms = await this.mongo.db!.collection('forms').aggregate([ { $group: { _id: '$kind', count: { $sum: 1 } } } ]).toArray()
  for (const form of forms) res[form._id] = form.count

  return res
}

async function finishFormUpdate (request: FastifyRequest, _reply: FastifyReply, form: StoreForm) {
  const user = request.user as User
  const message = await fetchHonkMessage(config.honks.formsChannel, form.messageId)

  const modMessage = form.approved
    ? `Form **approved** by ${user.username}#${user.discriminator}`
    : `Form **rejected** by ${user.username}#${user.discriminator} for the following reason: ${form.reviewReason}`

  const dmMessage = form.approved
    ? DmMessages[form.kind].approved
    : DmMessages[form.kind].rejected

  if (message.thread) {
    await dispatchHonk(config.honks.formsChannel, { content: modMessage }, `thread_id=${message.thread.id}`)
  } else {
    await editHonkMessage(config.honks.formsChannel, message.id, `${message.content}\n\n${modMessage}`)
  }

  const couldDm = await sendDm(
    form.submitter as unknown as string,
    `Hey $username,\n\n${dmMessage.replace('$reason', form.reviewReason ?? '')}\n\nCheers,\nPowercord Staff`
  )

  return { couldDm: couldDm }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(crudModule, {
    data: {
      collection: 'forms',
      projection: {
        complianceLegal: 0,
        complianceGuidelines: 0,
        complianceSecurity: 0,
        compliancePrivacy: 0,
        complianceCute: 0,
        'submitter.accounts': 0,
        'submitter.badges': 0,
        'submitter.createdAt': 0,
        'submitter.patronTier': 0,
      },
      aggregation: [
        { $lookup: { from: 'users', localField: 'submitter', foreignField: '_id', as: 'submitter' } },
        { $unwind: { path: '$submitter', preserveNullAndEmptyArrays: true } },
        { $set: { 'submitter.id': '$submitter._id' } },
        { $unset: 'submitter._id' },
      ],
      modules: {
        readAll: { filter: [ 'kind' ], all: true },
        create: false,
        update: {
          post: finishFormUpdate,
          schema: updateFormSchema,
        },
      },
    },
  })

  fastify.get('/count', getFormCount)
}
