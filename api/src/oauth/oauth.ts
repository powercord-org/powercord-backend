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

import qs from 'querystring'
import fetch from 'node-fetch'
import config from '../config.js'

type OAuthTokens = { access_token: string, refresh_token: string, expires_in: number }

export default abstract class OAuth<TUser = Record<string, string>> { // todo: rewrite as a fastify plugin (see crud.ts)
  constructor (
    private clientId: string,
    private clientSecret: string,
    private authorizeUrl: string,
    private tokenUrl: string
  ) {}

  abstract get scopes (): string[]

  async getToken (token: string): Promise<OAuthTokens> {
    return this.requestToken(token, 'authorization_code')
  }

  async refreshToken (token: string): Promise<OAuthTokens> {
    return this.requestToken(token, 'refresh_token')
  }

  getRedirectUrl (): string {
    const data = qs.encode({
      scope: this.scopes.join(' '),
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: `${config.domain}/api/v2/oauth/${this.constructor.name.toLowerCase()}`
    })

    return `${this.authorizeUrl}?${data}`
  }

  abstract getCurrentUser(token: string): Promise<TUser>

  private async requestToken (token: string, type: string): Promise<OAuthTokens> {
    return fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: qs.encode({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: `${config.domain}/api/v2/oauth/${this.constructor.name.toLowerCase()}`,
        grant_type: type,
        [type === 'authorization_code' ? 'code' : 'refresh_token']: token
      })
    }).then(r => r.json())
  }
}

