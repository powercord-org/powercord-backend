/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import fetch from 'node-fetch'
import config from '@powercord/shared/config'
import { getOrCompute } from '../../utils/cache.js'

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
      body: JSON.stringify({ query: query }),
    })

    payload = await res.json() as any
    items.push(...payload.data.repository.issues.nodes)
  } while (payload.data.repository.issues.pageInfo.hasNextPage)
  return items
}

export async function fetchSuggestions (): Promise<Suggestion[]> {
  return getOrCompute('gh_suggestions', async () => {
    const all = await fetchAll()
    return all.sort((a, b) => a.reactions.totalCount > b.reactions.totalCount ? -1 : a.reactions.totalCount < b.reactions.totalCount ? 1 : 0)
      .filter((i) => i.body.includes('###') && i.body.includes('----'))
      .map((issue) => ({
        id: issue.number,
        title: issue.title,
        author: issue.author,
        description: issue.body.split('###')[1].substring(12).split('----')[0].replace(/\r/g, '').replace(/(^\n+)|(\n+$)/g, ''),
        upvotes: issue.reactions.totalCount,
        wip: Boolean(issue.labels.nodes.find((l) => l.name === 'work in progress')),
      }))
  }, true)
}
