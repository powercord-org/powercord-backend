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

export enum InteractionErrorCode {
  // Unregistered command/component
  InteractionNotFound,
  // Registered command, no route found
  CommandRouteNotFound,
  // Handler did not respond within 3 seconds
  InvocationTimeout,
  // Handler threw an exception
  InvocationException,
}

const Messages = {
  [InteractionErrorCode.InteractionNotFound]: 'interaction not found',
  [InteractionErrorCode.CommandRouteNotFound]: 'could not route slash command',
  [InteractionErrorCode.InvocationTimeout]: 'interaction did not respond within 3 seconds',
  [InteractionErrorCode.InvocationException]: 'handler threw an exception',
}

export type ErrorHandler = (err: InteractionError) => void

export interface IInteractionError extends Error {
 code: InteractionErrorCode
 interaction: string
 cause?: Error
}

export class InteractionError extends Error implements IInteractionError {
  constructor (public code: InteractionErrorCode, public interaction: string, public cause?: Error) {
    super(Messages[code])
  }
}

let dispatcher: ErrorHandler = (err) => {
  console.error(`Interaction ${err.interaction} failed to execute\n${err.stack}`)
  if (err.cause) console.error(`Caused by: ${err.cause.stack}`)
}

export function dispatchError (err: InteractionError) {
  process.nextTick(() => {
    dispatcher(err)
  })
}

export function registerErrorHandler (handler: ErrorHandler) {
  dispatcher = handler
}
