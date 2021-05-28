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

import type { Attributes } from 'preact'
import type { Eligibility } from '@powercord/types/store'
import { h } from 'preact'

import FormLayout from './Layout'
import { TextField, TextareaField, CheckboxField } from '../../util/Form'

type FormProps = Attributes & { eligibility?: Eligibility }

export default function HostingForm ({ eligibility }: FormProps) {
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
