import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import cs from 'classnames'
import { icon } from '../lib/util'

export const Modal = ({ className, onClose, children }) => {
  const elRef = useRef(null)

  if (!elRef.current) {
    elRef.current = document.createElement('div')
  }

  useEffect(() => {
    const el = elRef.current
    el.className = cs('modal', className)
    document.body.appendChild(el)

    return () => {
      el.remove()
    }
  }, [className])

  return createPortal(
    <div className='modal-box'>
      <button className='modal-close' onClick={onClose}>
        {icon('remove')}
      </button>
      <div className='modal-content'>
        {children}
      </div>
    </div>,
    elRef.current,
  )
}
