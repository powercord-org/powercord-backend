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

export const Time = Object.freeze({
  SECOND: 1e3,
  MINUTE: 60e3,
  HOUR: 3600e3,
  DAY: 86400e3,
  WEEK: 86400e3 * 7,
  MONTH: 86400e3 * 30,
  YEAR: 86400e3 * 365
})

export const TIME_UNITS = Object.freeze(Object.keys(Time))

// Stupid but enough:tm:
export const pluralify = (c, w) => c === 1 ? w : `${w}s`

// Doesn't account for real month duration nor leap years, screw this
export function formatDate (date) {
  const ms = new Date(date).getTime()
  const elapsed = Date.now() - ms
  if (elapsed <= 0) return 'just now'
  for (let i = 1; i < TIME_UNITS.length; i++) {
    if (elapsed < Time[TIME_UNITS[i]]) {
      const label = TIME_UNITS[i - 1].toLowerCase()
      const delta = Math.floor(elapsed / Time[TIME_UNITS[i - 1]])
      return `${delta} ${pluralify(delta, label)} ago`
    }
  }

  const delta = Math.floor(elapsed / Time.YEAR)
  return `${delta} ${pluralify(delta, 'year')} ago`
}
