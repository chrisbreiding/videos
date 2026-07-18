import { useEffect, useRef, useCallback } from 'react'

export const Resizer = ({
  height,
  minHeight,
  maxHeight,
  onResizeStart,
  onResize,
  onResizeEnd,
}: {
  height: number
  minHeight: number
  maxHeight: number
  onResizeStart: () => void
  onResize: (height: number) => void
  onResizeEnd: () => void
}) => {
  const isDragging = useRef(false)

  const startResize = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()

      isDragging.current = true
      onResizeStart()
    },
    [onResizeStart],
  )

  const resize = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isDragging.current) {
        e.preventDefault()

        let height = (e as MouseEvent).pageY
        if (height < minHeight) height = minHeight
        if (height > maxHeight) height = maxHeight

        onResize(height)
      }
    },
    [minHeight, maxHeight, onResize],
  )

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
      className="resizer"
      style={{ top: height }}
      onMouseDown={startResize}
      onTouchStart={startResize}
    />
  )
}
