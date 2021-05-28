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

export const Endpoints = {
  LOGIN: '/api/v2/login',
  LOGOUT: '/api/v2/logout',
  USER_SELF: '/api/v2/users/@me',
  LINK_SPOTIFY: '/api/v2/oauth/spotify',
  UNLINK_SPOTIFY: '/api/v2/oauth/spotify/unlink',
  YEET_ACCOUNT: '/api/v2/oauth/discord/unlink',
  USER_AVATAR: (id: string) => `/api/v2/avatar/${id}.png`,

  ADVISORIES: '/api/v2/advisories',
  ADVISORY: (id: string) => `/api/v2/advisories/${id}`,

  STORE_FORM_ELIGIBILITY: '/api/v2/store/forms/eligibility',
  STORE_FORM: (id: string) => `/api/v2/store/forms/${id}`,

  DOCS_CATEGORIES: '/api/v2/docs/categories',
  DOCS_DOCUMENT: (doc: string) => `/api/v2/docs/${doc}`,
  DOCS_CATEGORIZED: (cat: string, doc: string) => `/api/v2/docs/${cat}/${doc}`,

  CONTRIBUTORS: '/api/v2/stats/contributors',
  STATS: '/api/v2/stats/numbers',
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

  DICKSWORD: 'https://discord.gg/gs4ZMbBfCh',
  PATREON: 'https://patreon.com/aetheryx',
  GITHUB: 'https://github.com/powercord-org',

  ADVISORIES: '/advisories',
  ADVISORY: (id: string) => `/advisories/${id}`,
}
