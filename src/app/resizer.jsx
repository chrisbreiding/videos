import React, { useEffect, useRef, useCallback } from 'react'

export const Resizer = ({
  height,
  minHeight,
  maxHeight,
  onResizeStart,
  onResize,
  onResizeEnd,
}) => {
  const isDragging = useRef(false)

  const startResize = useCallback((e) => {
    e.preventDefault()

    isDragging.current = true
    onResizeStart()
  }, [onResizeStart])

  const resize = useCallback((e) => {
    if (isDragging.current) {
      e.preventDefault()

      let height = e.pageY
      if (height < minHeight) height = minHeight
      if (height > maxHeight) height = maxHeight

      onResize(height)
    }
  }, [minHeight, maxHeight, onResize])

  const endResize = useCallback(() => {
    if (isDragging.current) {
      onResizeEnd()
    }
    isDragging.current = false
  }, [onResizeEnd])

  useEffect(() => {
    document.addEventListener('mousemove', resize)
    document.addEventListener('touchmove', resize)
    document.addEventListener('mouseup', endResize)
    document.addEventListener('touchend', endResize)

    return () => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('touchmove', resize)
      document.removeEventListener('mouseup', endResize)
      document.removeEventListener('touchend', endResize)
    }
  }, [resize, endResize])

  return (
    <div
      className='resizer'
      style={{ top: height }}
      onMouseDown={startResize}
      onTouchStart={startResize}
    />
  )
}
