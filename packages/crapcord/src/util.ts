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

export type Deferred = { promise: Promise<void>, resolve: Function, reject: Function }

export function makeDeferred (): Deferred {
  const deferred: Deferred = {} as Deferred
  deferred.promise = new Promise((resolve, reject) => Object.assign(deferred, { resolve: resolve, reject: reject }))
  return deferred
}


export type CamelCaseString<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCaseString<P3>}`
  : Lowercase<S>

export type SneakCaseString<S extends string> = S extends `${infer C0}${infer R}`
  ? `${C0 extends Lowercase<C0> ? '' : '_'}${Lowercase<C0>}${SneakCaseString<R>}`
  : Lowercase<S>

export type CamelCase<T> = T extends Array<any>
  ? { [K in keyof T]: T[K] extends Record<string, any> ? CamelCase<T[K]> : T[K] }
  : { [K in keyof T as CamelCaseString<string &K>]: T[K] extends Record<string, any> ? CamelCase<T[K]> : T[K] }

export type SneakCase<T> = T extends Array<any>
  ? { [K in keyof T]: T[K] extends Record<string, any> ? SneakCase<T[K]> : T[K] }
  : { [K in keyof T as SneakCaseString<string &K>]: T[K] extends Record<string, any> ? SneakCase<T[K]> : T[K] }

export function toCamelCase<T extends string> (str: T): CamelCaseString<T> {
  let res = ''
  for (let i = 0; i < str.length; i++) {
    res += str[i] === '_' ? str[++i].toUpperCase() : str[i]
  }

  return res as CamelCaseString<T>
}

export function toSneakCase<T extends string> (str: T): SneakCaseString<T> {
  let res = ''
  for (let i = 0; i < str.length; i++) {
    const chr = str[i]
    res += chr >= 'A' && chr <= 'Z' ? `_${chr.toLowerCase()}` : chr
  }

  return res as SneakCaseString<T>
}

export function objectToCamelCase<T extends Record<PropertyKey, any> | any[]> (object: T): CamelCase<T> {
  if (Array.isArray(object)) {
    return object.map((item) => typeof item === 'object' ? objectToCamelCase(item) : item) as CamelCase<T>
  }

  const res: Record<PropertyKey, any> = {}
  for (const key in object) {
    if (key in object) {
      const val = object[key]
      const newKey = typeof key === 'string' ? toCamelCase(key) : key
      const newVal = typeof val === 'object' ? objectToCamelCase(val) : val
      res[newKey] = newVal
    }
  }

  return res as CamelCase<T>
}

export function objectToSneakCase<T extends Record<PropertyKey, any> | any[]> (object: T): SneakCase<T> {
  if (Array.isArray(object)) {
    return object.map((item) => typeof item === 'object' ? objectToSneakCase(item) : item) as SneakCase<T>
  }

  const res: Record<PropertyKey, any> = {}
  for (const key in object) {
    if (key in object) {
      const val = object[key]
      const newKey = typeof key === 'string' ? toSneakCase(key) : key
      const newVal = typeof val === 'object' ? objectToSneakCase(val) : val
      res[newKey] = newVal
    }
  }

  return res as SneakCase<T>
}
