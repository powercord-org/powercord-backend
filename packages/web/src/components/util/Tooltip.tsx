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

import type { VNode } from 'preact'
import { h, Fragment, cloneElement } from 'preact'
import { useCallback, useRef, useState } from 'preact/hooks'
import { createPortal } from 'preact/compat'

import style from './tooltip.module.css'

type TooltipProps = {
  children: VNode<any>
  text: string
  position?: 'top' | 'bottom'
  align?: 'left' | 'left-center' | 'right' | 'right-center' | 'center'
}

export default function Tooltip ({ children, text, position, align }: TooltipProps) {
  position = position ?? 'top'
  align = align ?? 'left'

  const elementRef = useRef<HTMLElement>()
  const tooltipRef = useRef<HTMLDivElement>()
  const [ display, setDisplay ] = useState(false)
  const ogOnMouseEnter = children.props.onMouseEnter
  const onMouseEnter = useCallback((e: MouseEvent) => {
    setDisplay(true)
    if (ogOnMouseEnter) {
      ogOnMouseEnter(e)
    }
  }, [ ogOnMouseEnter ])

  const ogOnMouseLeave = children.props.onMouseLeave
  const onMouseLeave = useCallback((e: MouseEvent) => {
    setDisplay(false)
    if (ogOnMouseLeave) {
      ogOnMouseLeave(e)
    }
  }, [ ogOnMouseLeave ])

  let tooltip = null
  if (display && elementRef.current) {
    const css: Record<string, any> = {}
    const className = [ style.tooltip ]
    const rect = elementRef.current.getBoundingClientRect()

    if (align === 'left' || align === 'left-center') {
      className.push(style.alignLeft)
      if (align === 'left') {
        css.left = rect.x - 3
      } else {
        css.left = rect.x - 12 + (rect.width / 2)
      }
    }
    if (align === 'right' || align === 'right-center') {
      className.push(style.alignRight)
      const innerWidth = document.getElementById('app')!.getBoundingClientRect().width
      if (align === 'right') {
        css.right = innerWidth - (rect.x + rect.width)
      } else {
        css.right = innerWidth - (rect.x + rect.width) - 12 + (rect.width / 2)
      }
    }
    if (align === 'center') {
      className.push(style.alignCenter)
      const width = tooltipRef.current ? tooltipRef.current.getBoundingClientRect().width : 0
      css.left = rect.x + ((rect.width - width) / 2)
    }

    if (position === 'top') {
      className.push(style.positionTop)
      css.top = rect.y - (tooltipRef.current ? tooltipRef.current.getBoundingClientRect().height : 32) - 6
    }
    if (position === 'bottom') {
      className.push(style.positionBottom)
      css.top = rect.y + rect.height + (tooltipRef.current ? tooltipRef.current.getBoundingClientRect().height : 32) + 6
    }

    tooltip = createPortal(
      <div ref={tooltipRef} className={className.join(' ')} style={css}>{text}</div>,
      document.body
    )
  }

  return h(Fragment, null, cloneElement(children, { ref: elementRef, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave }), tooltip)
}
