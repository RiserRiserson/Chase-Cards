'use client'

import { useEffect, useRef } from 'react'

type Props = {
  width: number
  height: number
}

export function GridOverlay({ width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    // ---------------- BASE SETTINGS ----------------
    const baseAspectRatio = 1070 / 1500

    const desiredWidthScaleFactor = 0.85
    const desiredHeightScaleFactor = 0.85

    let outerWidth = width * desiredWidthScaleFactor
    let outerHeight = outerWidth / baseAspectRatio

    if (outerHeight > height * desiredHeightScaleFactor) {
      outerHeight = height * desiredHeightScaleFactor
      outerWidth = outerHeight * baseAspectRatio
    }

    if (outerWidth > width * desiredWidthScaleFactor) {
      outerWidth = width * desiredWidthScaleFactor
      outerHeight = outerWidth / baseAspectRatio
    }

    const scaleRatio = outerWidth / 1070

    const numRectangles = 5
    const insetStep = 18 * scaleRatio

    const cropMarkLength = 70 * scaleRatio
    const cropMarkStroke = Math.max(1, 8 * scaleRatio)

    const rectStroke = Math.max(1, 4 * scaleRatio)

    const startX = (width - outerWidth) / 2
    const startY = (height - outerHeight) / 2

    const endX = startX + outerWidth
    const endY = startY + outerHeight

    // ---------------- RECTANGLES ----------------
    for (let i = 0; i < numRectangles; i++) {
      const inset = i * insetStep

      const rectX = startX + inset
      const rectY = startY + inset

      const rectW = outerWidth - inset * 2
      const rectH = outerHeight - inset * 2

      if (rectW <= 0 || rectH <= 0) break

      ctx.beginPath()

      if (i === 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.9)'
        ctx.setLineDash([])
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'
        ctx.setLineDash(i % 2 === 1 ? [10 * scaleRatio] : [])
      }

      ctx.lineWidth = rectStroke

      ctx.strokeRect(rectX, rectY, rectW, rectH)
    }

    // ---------------- CROP MARKS ----------------
    ctx.strokeStyle = 'black'
    ctx.lineWidth = cropMarkStroke
    ctx.setLineDash([])

    const drawLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // corners
    drawLine(startX - cropMarkLength, startY, startX, startY)
    drawLine(startX, startY - cropMarkLength, startX, startY)

    drawLine(endX, startY, endX + cropMarkLength, startY)
    drawLine(endX, startY - cropMarkLength, endX, startY)

    drawLine(startX - cropMarkLength, endY, startX, endY)
    drawLine(startX, endY, startX, endY + cropMarkLength)

    drawLine(endX, endY, endX + cropMarkLength, endY)
    drawLine(endX, endY, endX, endY + cropMarkLength)

    // midpoints
    const midX = startX + outerWidth / 2
    const midY = startY + outerHeight / 2

    drawLine(midX, startY - cropMarkLength, midX, startY)
    drawLine(midX, endY, midX, endY + cropMarkLength)

    drawLine(startX - cropMarkLength, midY, startX, midY)
    drawLine(endX, midY, endX + cropMarkLength, midY)

  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}