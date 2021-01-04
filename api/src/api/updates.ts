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

// api:
// POST /api/v2/updates/check
// ~> [
// ~>   { "repo": "cyyynthia/cynthia.dev", "hash": "a6c5baf24ade30b8fdbfb436b1dbed4f97db7354" },
// ~>   { "repo": "cyyynthia/pronoundb.org", "hash": "0de741f016ee4ffe095bd51f75e22e85c364e31a" }
// ~> ]
//
// <~ {
// <~   "cyyynthia/cynthia.dev": {
// <~     "hasUpdates": true,
// <~     "commits": [
// <~       {
// <~         "id": "f548f33",
// <~         "message": "Update deps",
// <~         "link": "https://github.com/cyyynthia/cynthia.dev/commit/f548f33ef9e8a06e7262f2de960473fc10493ed9",
// <~         "committer": {
// <~           "name": "Cynthia",
// <~           "email": "cynthia@cynthia.dev"
// <~         },
// <~         "signature": {
// <~           "valid": true,
// <~           "github": false,
// <~           "name": "Cynthia",
// <~           "login": "cyyynthia",
// <~           "email": "cynthia@cynthia.dev",
// <~           "key": "CB561F74DCEAE23B"
// <~         }
// <~       }
// <~     ]
// <~   },
// <~   "cyyynthia/pronoundb.org": {
// <~     "hasUpdates": false,
// <~     "commits": []
// <~   }
// <~ }
//
// Cache: 1m
// fetch (5? 10? 25? 50?) commits from gql
//  --> If commits[0].id !== req.id >>> has MAYBE updates
//  --> If all commits between commits[0].id and commits[n].id contain "[skip update]" >>> Don't trigger an update
//  --> If at least 1 commit isn't marked with "[skip update]" >>> send everything

import type { FastifyInstance } from 'fastify'

// @ts-expect-error -- not implemented
export default async function (fastify: FastifyInstance): Promise<void> {

}
