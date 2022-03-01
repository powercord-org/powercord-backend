/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { Attributes } from 'preact'
import type { Eligibility } from '@powercord/types/store'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'

import FormLayout from './Layout'
import { TextField, TextareaField, CheckboxField } from '../../util/Form'

type FormProps = Attributes & { eligibility?: Eligibility }

export default function VerificationForm ({ eligibility }: FormProps) {
  useTitle('Get verified')

  return (
    <FormLayout id='verification' title='Get verified' eligibility={eligibility}>
      <TextField
        label='Store URL'
        name='workUrl'
        note={'The URL of the work you want to get verified. Must be an https://powercord.dev/store url.'}
        maxLength={256}
        required
      />
      <TextareaField
        label='About your work'
        name='workAbout'
        note='Tell us a bit about your work, what it does, and how much effort you put in your work.'
        maxLength={2048}
        minLength={128}
        required
      />
      <TextareaField
        label='About you'
        name='developerAbout'
        note='Tell us a bit about you, if you are an active member of our community, or some who lives in the shadows.'
        maxLength={2048}
        minLength={128}
        required
      />
      <TextareaField
        label='Your projects for the future'
        name='workFuture'
        note={'How do you see the future for your work? Will you keep working on it, do you think it\'ll be a long-lasting plugin?'}
        maxLength={2048}
        minLength={128}
        required
      />
      <TextareaField
        label='Why do you want to be verified?'
        name='why'
        note='Tell us a bit about what the verification represents for you.'
        maxLength={2048}
        minLength={128}
        required
      />
      <CheckboxField
        label='I am sufficiently cute to submit this form'
        name='complianceCute'
        note={'Our very accurate systems detected you\'re super cute and therefore able to submit this form.'}
        value={true}
        disabled
      />
    </FormLayout>
  )
}
