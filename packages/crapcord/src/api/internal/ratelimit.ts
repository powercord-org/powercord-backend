/*
 * Copyright (c) 2022 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { Dispatcher } from 'undici'
import type { Deferred } from '../../util/deferred.js'
import { makeDeferred } from '../../util/deferred.js'

type Bucket = {
  limit: number
  remaining: number
  resetPromise?: Promise<void>
  fresh: boolean
}

const discovery = new Map<string, Deferred<void>>()
const buckets = new Map<string, Bucket>()
const bucketIds = new Map<string, string>()

const locks = new Map<string, Promise<void>>([ [ '_global', Promise.resolve() ] ])

export async function acquireRequest (key: string) {
  // wait until the rate limit info for this route has been discovered
  // only 1 request goes through during this phase
  const discover = discovery.get(key)
  if (discover) await discover.promise

  key = bucketIds.get(key) ?? key
  const bucket = buckets.get(key)
  if (!bucket) {
    // we're discovering what the limit looks like
    const deferred = makeDeferred<void>()
    discovery.set(key, deferred)

    // wait for global lock to be released (global rate-limit)
    return locks.get('_global')
  }

  // wait for all relevant locks to be released
  await Promise.all([ locks.get('_global'), locks.get(key) ])

  // if we don't have requests left, wait until the new limit window
  // why as a while? because we may drain an entire window and not be done with queued requests
  while (bucket.remaining === 0) {
    // new bucket reset may not be available immediately if we consume all requests at once
    // sleep for a few ms to avoid dead locks until we have the next window
    while (!bucket.resetPromise) await new Promise((resolve) => setTimeout(resolve, 50))
    await bucket.resetPromise
  }

  bucket.remaining--
  return Promise.resolve()
}

const e = (v: undefined | string | string[]): string | undefined => Array.isArray(v) ? v[0] : v
export function consumeResponse (key: string, response: Dispatcher.ResponseData) {
  const rawKey = key
  const limitBucket = e(response.headers['x-ratelimit-bucket']) || key
  const limitScope = e(response.headers['x-ratelimit-scope'])
  const limitLimit = Number(e(response.headers['x-ratelimit-limit']))
  const limitRemaining = Number(e(response.headers['x-ratelimit-remaining']))
  const limitResetAfter = (Number(e(response.headers['x-ratelimit-reset-after'])) * 1e3) + 25

  // apparently discord sometimes doesn't give any limit information for added fantasy, very cool
  const limitsTransmitted = !isNaN(limitLimit) && !isNaN(limitRemaining) && !isNaN(limitResetAfter)

  if (limitBucket) {
    bucketIds.set(key, limitBucket)
    key = limitBucket
  }

  if (response.statusCode === 429) {
    // when we get in there, there is a high chance we encountered some form of non-documented limit ("sub-limits")
    // in these cases, the x-ratelimit-* headers may be inaccurate and shouldn't be trusted for limit release
    // retry-after and the body's retry_after are always accurate, so let's pick them
    const retryAfter = (Number(response.headers['retry-after']) * 1e3) + 25
    const lockName = limitScope === 'global' ? '_global' : key

    const lock = makeDeferred<void>()
    locks.set(lockName, lock.promise)
    setTimeout(() => {
      locks.delete(lockName)
      lock.resolve()
    }, retryAfter)
  }

  if (limitsTransmitted) {
    const bucket = buckets.get(limitBucket) || {
      limit: limitLimit,
      remaining: limitRemaining,
      resetPromise: void 0,
      fresh: true,
    }

    if (!buckets.has(limitBucket)) {
      buckets.set(limitBucket, bucket)
    }

    if (bucket.fresh) {
      const reset = makeDeferred<void>()
      bucket.resetPromise = reset.promise
      bucket.fresh = false

      setTimeout(() => {
        bucket.fresh = true
        bucket.resetPromise = void 0
        bucket.remaining = bucket.limit
        reset.resolve()
      }, limitResetAfter)
    }

    // always update limit, in case dynamic limit changes
    bucket.limit = limitLimit
  }

  // notify requests pending discovery that it's done
  const discover = discovery.get(rawKey)
  if (discover) {
    discovery.delete(rawKey)
    discover.resolve()
  }
}
