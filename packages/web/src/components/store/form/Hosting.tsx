/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes } from 'preact'
import type { Eligibility } from '@powercord/types/store'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'

import FormLayout from './Layout'
import { TextField, TextareaField, CheckboxField } from '../../util/Form'

type FormProps = Attributes & { eligibility?: Eligibility }

export default function HostingForm ({ eligibility }: FormProps) {
  useTitle('Host a backend')

  return (
    <FormLayout id='hosting' title='Host a backend' eligibility={eligibility}>
      <TextField
        label='Repository URL'
        name='repoUrl'
        note={'This is the repository we\'ll pull the code to run from. It must contain everything and be ready for deployment.'}
        maxLength={256}
        required
      />
      <TextareaField
        label={'Backend\'s purpose'}
        name='purpose'
        note={'Describe what your backend does and what you\'ll be using it for.'}
        maxLength={1024}
        required
      />
      <TextareaField
        label='Technical details'
        name='technical'
        note='What language is your backend in? What are the technologies used in it?'
        maxLength={1024}
        required
      />
      <TextField
        label='Desired subdomain'
        name='subdomain'
        note={'Request here the subdomain you\'d like your backend to run on.'}
        minLength={3}
        maxLength={16}
        required
      />
      <TextareaField
        label='Notes for reviewers'
        name='reviewNotes'
        note='Feel free to tell us anything you believe will be useful for the review process.'
        maxLength={1024}
      />
      <CheckboxField
        name='complianceSecurity'
        label='My backend meets reasonable standards regarding security'
      />
      <CheckboxField
        name='compliancePrivacy'
        label='My backend and its operations comply with all the applicable privacy laws'
      />
    </FormLayout>
  )
}
