/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { Attributes } from 'preact'
import type { Eligibility } from '@powercord/types/store'
import { h, Fragment } from 'preact'
import { useTitle } from 'hoofd/preact'

import FormLayout from './Layout'
import { TextField, TextareaField, CheckboxField } from '../../util/Form'
import { Routes } from '../../../constants'

type FormProps = Attributes & { eligibility?: Eligibility }

export default function PublishForm ({ eligibility }: FormProps) {
  useTitle('Publish your work')

  return (
    <FormLayout id='publish' title='Publish your work' eligibility={eligibility}>
      <TextField
        label='Repository URL'
        name='repoUrl'
        note={'In order for us to review your work you\'ll need to publish it to a repository (on GitHub, or GitLab, or somewhere else). For plugins, once the review process is complete you will receive a repo in the powercord-community GitHub organization, which will be the official home of your plugin.'}
        maxLength={256}
        required
      />
      <TextField
        label='BetterDiscord alternative'
        name='bdAlternative'
        note='Let us know if your work is an alternative to an existing one for BetterDiscord. Provide a URL from betterdiscord.app.'
        maxLength={256}
      />
      <TextareaField
        label='Notes for reviewers'
        name='reviewNotes'
        note='Feel free to tell us anything you believe will be useful for the review process. If you used discouraged methods such as direct API calls, providing an explanation here can help speeding up the review process if your use is legitimate.'
        maxLength={1024}
      />
      <CheckboxField
        name='complianceGuidelines'
        label={<>I certify my work complies with the <a href={Routes.GUIDELINES}>Powercord Guidelines</a></>}
      />
      <CheckboxField
        name='complianceLegal'
        label='By publishing this work, I grant Powercord the non-transferable right to redistribute verbatim copies of my work and allow its use along with Powercord if these are not already granted by the license applied to the work'
      />
    </FormLayout>
  )
}
