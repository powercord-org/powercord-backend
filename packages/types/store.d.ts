/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
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
