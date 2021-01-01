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

import fetch from 'node-fetch'
import { getOrCompute } from '../../utils/cache.js'
import config from '../../config.js'

// todo: move for frontend
type GithubIssue = {
  number: number
  title: string
  author: { login: string, avatarUrl: string } | null
  body: string
  reactions: { totalCount: number }
  labels: { nodes: Array<{ name: string }> }
}

type Suggestion = {
  id: GithubIssue['number']
  title: GithubIssue['title']
  author: GithubIssue['author']
  description: string
  upvotes: number
  wip: boolean
}

function gqlQuery (after: string): string {
  return `query {
    repository(name: "suggestions", owner: "powercord-community") {
      issues(states: OPEN, first: 100, labels: ["up for grabs", "work in progress"], orderBy: {field: CREATED_AT, direction: DESC}${after ? `, after: "${after}"` : ''}) {
        nodes { title body author { avatarUrl login } reactions(content: THUMBS_UP) { totalCount } publishedAt number labels(first: 10) { nodes { name } } }
        pageInfo { endCursor hasNextPage }
      }
    }
  }`
}

async function fetchAll (): Promise<GithubIssue[]> {
  let payload
  const items = []
  do {
    const query = gqlQuery(payload && payload.data.repository.issues.pageInfo.endCursor)
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `Bearer ${config.ghToken}` },
      body: JSON.stringify({ query })
    })

    payload = await res.json()
    items.push(...payload.data.repository.issues.nodes)
  } while (payload.data.repository.issues.pageInfo.hasNextPage)
  return items
}

export async function fetchSuggestions (): Promise<Suggestion[]> {
  return getOrCompute('gh_suggestions', async function () {
    const all = await fetchAll()
    return all.sort((a, b) => a.reactions.totalCount > b.reactions.totalCount ? -1 : a.reactions.totalCount < b.reactions.totalCount ? 1 : 0)
      .filter(i => i.body.includes('###') && i.body.includes('----'))
      .map(issue => {
        return {
          id: issue.number,
          title: issue.title,
          author: issue.author,
          description: issue.body.split('###')[1].substring(12).split('----')[0].replace(/\r/g, '').replace(/(^\n+)|(\n+$)/g, ''),
          upvotes: issue.reactions.totalCount,
          wip: !!issue.labels.nodes.find(l => l.name === 'work in progress')
        }
      })
  }, true)
}
