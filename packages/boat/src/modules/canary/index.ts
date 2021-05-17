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

import cron from 'node-cron'
import checkAppUpdates from './app.js'
import checkWebUpdates from './web.js'
import state, { commitCanaryState } from './state.js'

async function appUpdates () {
  const update = await checkAppUpdates()
  console.log(update)
  // todo: create & post embed
  return commitCanaryState()
}

async function webUpdates () {
  const update = await checkWebUpdates()
  console.log(update)
  // todo: create & post embed
  return commitCanaryState()
}

export default async function () {
  await checkWebUpdates()
  process.exit()

  // @ts-ignore
  if (state.__empty) {
    // @ts-ignore
    delete state.__empty
    // @ts-ignore
    await Promise.all([ checkAppUpdates(), checkWebUpdates() ])
    // @ts-ignore
    await commitCanaryState()
  }

  // @ts-ignore
  cron.schedule('*/5 * * * *', () => appUpdates())
  // @ts-ignore
  cron.schedule('30 */30 * * * *', () => webUpdates())
}

// dev
export const __skip = process.env.NODE_ENV !== 'development'
