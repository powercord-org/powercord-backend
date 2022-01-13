/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

export const Endpoints = {
  LOGIN: '/api/v2/login',
  LOGOUT: '/api/v2/logout',
  USER_SELF: '/api/v2/users/@me',
  LINK_ACCOUNT: (platform: string) => `/api/v2/oauth/${platform}`,
  UNLINK_ACCOUNT: (platform: string) => `/api/v2/oauth/${platform}/unlink`,
  YEET_ACCOUNT: '/api/v2/oauth/discord/unlink',
  USER_AVATAR: (id: string) => `/api/v2/avatar/${id}.png`,
  USER_AVATAR_DISCORD: (id: string, avatar: string) => `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`,
  DEFAULT_AVATAR_DISCORD: (dicrim: number) => `https://cdn.discordapp.com/embed/avatars/${dicrim % 6}.png?size=128`,

  STORE_FORM_ELIGIBILITY: '/api/v2/store/forms/eligibility',
  STORE_FORM: (id: string) => `/api/v2/store/forms/${id}`,

  DOCS_CATEGORIES: '/api/v2/docs/categories',
  DOCS_DOCUMENT: (doc: string) => `/api/v2/docs/${doc}`,
  DOCS_CATEGORIZED: (cat: string, doc: string) => `/api/v2/docs/${cat}/${doc}`,

  CONTRIBUTORS: '/api/v2/stats/contributors',
  STATS: '/api/v2/stats/numbers',

  BACKOFFICE_USERS: '/api/v2/backoffice/users',
  BACKOFFICE_USER: (id: string) => `/api/v2/backoffice/users/${id}`,
  BACKOFFICE_BANS: '/api/v2/backoffice/bans/',
  BACKOFFICE_BAN: (id: string) => `/api/v2/backoffice/bans/${id}`,
  BACKOFFICE_FORMS: '/api/v2/backoffice/forms?kind=hosting&kind=publish&kind=verification',
  BACKOFFICE_FORMS_COUNT: '/api/v2/backoffice/forms/count',
  BACKOFFICE_FORM: (id: string) => `/api/v2/backoffice/forms/${id}`,
  BACKOFFICE_REPORTS: '/api/v2/backoffice/forms?kind=reports',
}

export const Routes = {
  HOME: '/',
  ME: '/me',
  CONTRIBUTORS: '/contributors',
  STATS: '/stats',
  BRANDING: '/branding',
  FAQ: '/faq',

  STORE: '/store',
  STORE_PLUGINS: '/store/plugins',
  STORE_THEMES: '/store/themes',
  STORE_SUGGESTIONS: 'https://github.com/powercord-community/suggestions/issues?q=is%3Aissue+is%3Aopen+label%3A%22up+for+grabs%22',
  STORE_MANAGE: '/store/manage',
  STORE_FORMS: '/store/forms',
  STORE_PUBLISH: '/store/forms/publish',
  STORE_VERIFICATION: '/store/forms/verification',
  STORE_HOSTING: '/store/forms/hosting',
  STORE_COPYRIGHT: '/store/copyright',

  DOCS: '/docs',
  DOCS_ITEM: (cat: string, doc: string) => `/docs/${cat}/${doc}`,
  DOCS_GITHUB: 'https://github.com/powercord-org/documentation',
  GUIDELINES: '/guidelines',
  INSTALLATION: '/installation',
  PORKORD_LICENSE: '/porkord-license',
  TERMS: '/legal/tos',
  PRIVACY: '/legal/privacy',

  BACKOFFICE: '/backoffice',
  BACKOFFICE_USERS: '/backoffice/users',
  BACKOFFICE_BANS: '/backoffice/bans',
  BACKOFFICE_MONITORING: '/backoffice/monitoring',
  BACKOFFICE_STORE_ITEMS: '/backoffice/store/items',
  BACKOFFICE_STORE_TAGS: '/backoffice/store/tags',
  BACKOFFICE_STORE_FRONT: '/backoffice/store/front',
  BACKOFFICE_STORE_FORMS: '/backoffice/store/forms',
  BACKOFFICE_THREATS: '/backoffice/threats',
  BACKOFFICE_STORE_FORMS_FORM: (id: string) => `/backoffice/store/forms/${id}`,
  BACKOFFICE_STORE_REPORTS: '/backoffice/store/reports',
  BACKOFFICE_STORE_REPORTS_REPORT: (id: string) => `/backoffice/store/reports/${id}`,
  BACKOFFICE_EVENTS_SECRET: '/backoffice/events/secret',

  DICKSWORD: 'https://discord.gg/powercord',
  PATREON: 'https://patreon.com/aetheryx',
  GITHUB: 'https://github.com/powercord-org',
  GITHUB_USER: (user: string) => `https://github.com/${user}`,
}
