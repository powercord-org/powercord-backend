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

import type { FastifyInstance } from 'fastify'
import crudModule from './crud.js'

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

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(crudModule, {
    data: {
      collection: 'forms',
      projection: {
        kind: 0,
        complianceLegal: 0,
        complianceGuidelines: 0,
        complianceSecurity: 0,
        compliancePrivacy: 0,
        complianceCute: 0,
      },
      modules: {
        readAll: { filter: [ 'kind' ] },
        create: false,
      },
    },
  })

  fastify.get('/count', getFormCount)
}
