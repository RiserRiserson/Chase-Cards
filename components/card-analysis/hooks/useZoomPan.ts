'use client'

import { useState } from 'react'

export function useZoomPan() {
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [scale, setScale] = useState(1)

  const [isDragging, setIsDragging] = useState(false)
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartDrag({
      x: e.clientX - offsetX,
      y: e.clientY - offsetY
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setOffsetX(e.clientX - startDrag.x)
    setOffsetY(e.clientY - startDrag.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const factor = direction === 'in' ? 1.05 : 0.95
      return Math.min(3, Math.max(0.5, prev * factor))
    })
  }

  const resetTransform = () => {
    setOffsetX(0)
    setOffsetY(0)
    setScale(1)
  }

  return {
    offsetX,
    offsetY,
    scale,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoom,
    resetTransform
  }
}