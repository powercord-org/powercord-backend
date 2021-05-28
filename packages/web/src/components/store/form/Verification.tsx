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
import { h } from 'preact'

import FormLayout from './Layout'
import { TextField, TextareaField, CheckboxField } from '../../util/Form'

export default function VerificationForm (_: Attributes) {
  return (
    <FormLayout id='verification' title='Get verified'>
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
