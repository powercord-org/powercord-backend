/*
 * Copyright (c) 2022 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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

export function stringToCamelCase<T extends string> (str: T): CamelCaseString<T> {
  let res = ''
  for (let i = 0; i < str.length; i++) {
    res += str[i] === '_' ? str[++i].toUpperCase() : str[i]
  }

  return res as CamelCaseString<T>
}

export function stringToSneakCase<T extends string> (str: T): SneakCaseString<T> {
  let res = ''
  for (let i = 0; i < str.length; i++) {
    const chr = str[i]
    res += chr >= 'A' && chr <= 'Z' ? `_${chr.toLowerCase()}` : chr
  }

  return res as SneakCaseString<T>
}

export function toCamelCase<T extends Record<PropertyKey, any> | any[]> (object: T): CamelCase<T> {
  if (Array.isArray(object)) {
    return object.map((item) => typeof item === 'object' ? toCamelCase(item) : item) as CamelCase<T>
  }

  const res: Record<PropertyKey, any> = {}
  for (const key in object) {
    if (key in object) {
      const val = object[key]
      const newKey = typeof key === 'string' ? stringToCamelCase(key) : key
      const newVal = typeof val === 'object' ? toCamelCase(val) : val
      res[newKey] = newVal
    }
  }

  return res as CamelCase<T>
}

export function toSneakCase<T extends Record<PropertyKey, any> | any[]> (object: T): SneakCase<T> {
  if (Array.isArray(object)) {
    return object.map((item) => typeof item === 'object' ? toSneakCase(item) : item) as SneakCase<T>
  }

  const res: Record<PropertyKey, any> = {}
  for (const key in object) {
    if (key in object) {
      const val = object[key]
      const newKey = typeof key === 'string' ? stringToSneakCase(key) : key
      const newVal = typeof val === 'object' ? toSneakCase(val) : val
      res[newKey] = newVal
    }
  }

  return res as SneakCase<T>
}
