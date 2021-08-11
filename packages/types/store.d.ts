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

import { MinimalUser } from './users'

// 0 = Eligible; 1 = Closed; 2 = Banned
export type Eligibility = 0 | 1 | 2

export type EligibilityStatus = {
  publish: Eligibility,
  verification: Eligibility,
  hosting: Eligibility,
  reporting: Eligibility,
}

type PendingForm = { reviewed?: false, approved?: boolean, reviewer?: null, reviewReason?: null, submitter: MinimalUser }
type ReviewedForm = { reviewed: true, approved: boolean, reviewer: MinimalUser, reviewReason?: string, submitter?: MinimalUser }

export type Form = (PendingForm | ReviewedForm) & {
  id: string
  kind: 'publish' | 'verification' | 'hosting'
  messageId: string
}

export type FormPublish = Form & {
  kind: 'publish'
  repoUrl: string
  bdAlterative: string
  reviewNotes: string
}

export type FormVerification = Form & {
  kind: 'verification'
  workUrl: string
  workAbout: string
  developerAbout: string
  workFuture: string
  why: string
}

export type FormHosting = Form & {
  kind: 'hosting'
  repoUrl: string
  purpose: string
  technical: string
  subdomain: string
  reviewNotes: string
}

export type StoreForm = FormPublish | FormVerification | FormHosting
