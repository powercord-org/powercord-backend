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

async function contributors () {
  const findUsers = (filters) =>
    this.mongo.db.collection('users').find(filters, {
      projection: {
        _id: true,
        username: true,
        discriminator: true,
        'accounts.github.login': true,
        'accounts.github.display': true
      }
    }).toArray()

  return {
    developers: await findUsers({ 'badges.developer': true }),
    staff: await findUsers({ 'badges.staff': true, 'badges.developer': false }),
    contributors: await findUsers({ 'badges.contributor': true })
  }
}

async function numbers () {
  return {
    users: await this.mongo.db.collection('users').countDocuments(),
    helpers: await this.mongo.db.collection('users').countDocuments({
      $or: [
        { 'badges.contributor': true },
        { 'badges.hunter': true },
        { 'badges.translator': true }
      ]
    }),
    plugins: 0,
    themes: 0
  }
}

module.exports = async function (fastify) {
  fastify.get('/contributors', contributors)
  fastify.get('/numbers', numbers)
}
