/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

declare module '*.svg' {
  import type { JSX } from 'preact'
  export default function (props: JSX.SVGAttributes): JSX.Element
}

declare module '*.svg?sprite=cutie' {
  import type { JSX } from 'preact'
  export default function (props: JSX.SVGAttributes): JSX.Element
}

declare module '*.svg?sprite=badges' {
  import type { JSX } from 'preact'
  export default function (props: JSX.SVGAttributes): JSX.Element
}

declare module '*.svg?file' {
  const asset: string
  export default asset
}
