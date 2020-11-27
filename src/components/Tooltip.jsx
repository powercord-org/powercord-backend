/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

import React, { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

import style from '@styles/tooltip.scss'

function Tooltip ({ children, text, position, align, forceDisplay }) {
  if (process.env.NODE_ENV === 'development' && forceDisplay) {
    console.warn('[Tooltip.jsx] Force display was turned on, make sure to remove it is intended before pushing it to production builds!')
  }

  if (!children) return null
  if (typeof children === 'string') {
    children = <span>{children}</span>
  }

  const [ elementRef, setElementRef ] = useState(null)
  const [ tooltipRef, setTooltipRef ] = useState(null)
  const [ display, setDisplay ] = useState(false)
  const ogOnMouseEnter = children.props.onMouseEnter
  const onMouseEnter = useCallback((e) => {
    setDisplay(true)
    if (ogOnMouseEnter) {
      ogOnMouseEnter(e)
    }
  }, [ ogOnMouseEnter ])

  const ogOnMouseLeave = children.props.onMouseLeave
  const onMouseLeave = useCallback((e) => {
    setDisplay(false)
    if (ogOnMouseLeave) {
      ogOnMouseLeave(e)
    }
  }, [ ogOnMouseLeave ])

  let tooltip = null
  if ((display || forceDisplay) && elementRef) {
    const css = {}
    const className = [ style.tooltip ]
    const rect = elementRef.getBoundingClientRect()

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
      const innerWidth = document.getElementById('react-root').getBoundingClientRect().width
      if (align === 'right') {
        css.right = innerWidth - (rect.x + rect.width)
      } else {
        css.right = innerWidth - (rect.x + rect.width) - 12 + (rect.width / 2)
      }
    }
    if (align === 'center') {
      className.push(style.alignCenter)
      const width = tooltipRef ? tooltipRef.getBoundingClientRect().width : 0
      css.left = rect.x + ((rect.width - width) / 2)
    }

    if (position === 'top') {
      className.push(style.positionTop)
      css.top = rect.y - (tooltipRef ? tooltipRef.getBoundingClientRect().height : 32) - 6
    }
    if (position === 'bottom') {
      className.push(style.positionBottom)
      css.top = rect.y + rect.height + (tooltipRef ? tooltipRef.getBoundingClientRect().height : 32) + 6
    }

    tooltip = createPortal(
      <div ref={r => setTooltipRef(r)} className={className.join(' ')} style={css}>{text}</div>,
      document.body
    )
  }

  return (
    <>
      {React.cloneElement(children, { ref: r => setElementRef(r), onMouseEnter, onMouseLeave })}
      {tooltip}
    </>
  )
}

Tooltip.displayName = 'Tooltip'
Tooltip.defaultProps = {
  position: 'top',
  align: 'left'
}
export default React.memo(Tooltip)
