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
import { h, Fragment } from 'preact'

import FormLayout from './Layout'
import { TextField, TextareaField, CheckboxField } from '../../util/Form'
import { Routes } from '../../../constants'

type FormProps = Attributes & { eligibility?: Eligibility }

export default function PublishForm ({ eligibility }: FormProps) {
  return (
    <FormLayout id='publish' title='Publish your work' eligibility={eligibility}>
      <TextField
        label='Repository URL'
        name='repoUrl'
        note={'In order for us to review your work you\'ll need to publish it to a temporary repository (on GitHub, or GitLab, or somewhere else). For plugins once the review process is complete you will receive a repo in the Community GitHub organization.'}
        maxLength={256}
        required
      />
      <TextField
        label='BetterDiscord alternative'
        name='bdAlternative'
        note='Let us know if your product is an alternative to an existing one for BetterDiscord. Provide a URL from betterdiscord.app.'
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
