'use client'

import { useState, useRef, useEffect } from 'react'
import { GridOverlay } from '../card-analysis/grid-overlay'

export function CardAnalysis() {
  const [image, setImage] = useState<string | null>(null)
  const [heatmap, setHeatmap] = useState<string | null>(null)

  const [centerScore, setCenterScore] = useState<number | null>(null)
  const [sharpnessScore, setSharpnessScore] = useState<number | null>(null)
  const [surfaceScore, setSurfaceScore] = useState<number | null>(null)
  const [finalGrade, setFinalGrade] = useState<number | null>(null)

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true)
  const [showGrid, setShowGrid] = useState<boolean>(true)

  // container sizing (grid + overlays)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      setDims({
        width: rect.width,
        height: rect.height
      })
    }

    update()
    window.addEventListener('resize', update)

    return () => window.removeEventListener('resize', update)
  }, [image])

  // ---------------- TRANSFORM STATE ----------------
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [scale, setScale] = useState(1)

  const [isDragging, setIsDragging] = useState(false)
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 })

  // ---------------- DRAG ----------------
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

  // ---------------- ZOOM (SMOOTH) ----------------
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

  // ---------------- IMAGE PROCESSING ----------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') return

      img.src = reader.result

      img.onload = () => {
        setImage(reader.result as string)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = img.width
        const height = img.height

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        const heatCanvas = document.createElement('canvas')
        heatCanvas.width = width
        heatCanvas.height = height
        const heatCtx = heatCanvas.getContext('2d')
        if (!heatCtx) return

        let leftWeight = 0
        let rightWeight = 0
        let topWeight = 0
        let bottomWeight = 0

        let edgeStrength = 0
        let surfaceNoise = 0
        let pixelCount = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          const brightness = (r + g + b) / 3

          const pixelIndex = i / 4
          const x = pixelIndex % width
          const y = Math.floor(pixelIndex / width)

          if (x < width / 2) leftWeight += brightness
          else rightWeight += brightness

          if (y < height / 2) topWeight += brightness
          else bottomWeight += brightness

          if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
            const right =
              (data[i + 4] + data[i + 5] + data[i + 6]) / 3

            const bottom =
              (data[i + width * 4] +
                data[i + width * 4 + 1] +
                data[i + width * 4 + 2]) / 3

            const diff =
              Math.abs(brightness - right) +
              Math.abs(brightness - bottom)

            edgeStrength += diff

            const localVariance =
              Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)

            surfaceNoise += localVariance

            const intensity = Math.min(255, localVariance * 4)

            heatCtx.fillStyle = `rgba(255, 0, 0, ${intensity / 255})`
            heatCtx.fillRect(x, y, 1, 1)

            pixelCount++
          }
        }

        const horizontalScore =
          100 -
          (Math.abs(leftWeight - rightWeight) /
            (leftWeight + rightWeight || 1)) *
            100

        const verticalScore =
          100 -
          (Math.abs(topWeight - bottomWeight) /
            (topWeight + bottomWeight || 1)) *
            100

        const center = (horizontalScore + verticalScore) / 2

        const avgEdge = edgeStrength / (pixelCount || 1)
        const sharpness = Math.min(100, (avgEdge / 35) * 100)

        const avgSurface = surfaceNoise / (pixelCount || 1)
        const surface = Math.max(0, 100 - avgSurface / 2)

        const grade =
          (center / 10) * 0.45 +
          (sharpness / 10) * 0.35 +
          (surface / 10) * 0.2

        setCenterScore(Math.round(center))
        setSharpnessScore(Math.round(sharpness))
        setSurfaceScore(Math.round(surface))
        setFinalGrade(Number(grade.toFixed(1)))

        setHeatmap(heatCanvas.toDataURL())
      }
    }

    reader.readAsDataURL(file)
  }

  const getLetterGrade = (score: number) => {
    if (score >= 9) return 'A+'
    if (score >= 8) return 'A'
    if (score >= 7) return 'B'
    if (score >= 6) return 'C'
    if (score >= 5) return 'D'
    return 'F'
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h2 className="text-2xl font-semibold">Card Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Centering, sharpness, surface defects + heatmap visualization
        </p>
      </div>

      <div className="border rounded-xl p-6 bg-card space-y-4">

        <input type="file" accept="image/*" onChange={handleImageUpload} />

        {/* CONTROLS */}
        {image && (
          <div className="flex gap-2 text-sm flex-wrap">
            <button onClick={() => handleZoom('in')}>Zoom +</button>
            <button onClick={() => handleZoom('out')}>Zoom -</button>
            <button onClick={resetTransform}>Reset</button>

            <button onClick={() => setShowGrid(prev => !prev)}>
              Toggle Grid
            </button>

            <button onClick={() => setShowHeatmap(prev => !prev)}>
              Toggle Heatmap
            </button>
          </div>
        )}

        {centerScore !== null && (
          <div>Centering: <b>{centerScore}/100</b></div>
        )}

        {sharpnessScore !== null && (
          <div>Sharpness: <b>{sharpnessScore}/100</b></div>
        )}

        {surfaceScore !== null && (
          <div>Surface: <b>{surfaceScore}/100</b></div>
        )}

        {finalGrade !== null && (
          <div className="text-lg mt-2">
            Final Grade: <b>{finalGrade}/10 ({getLetterGrade(finalGrade)})</b>
          </div>
        )}

        {/* IMAGE CONTAINER */}
        {image && (
          <div
            ref={containerRef}
            className="relative border rounded-xl overflow-hidden bg-muted w-full max-w-sm aspect-[2.5/3.5]"
          >

            {/* IMAGE LAYER (TRANSFORMED) */}
            <div
              className="absolute inset-0 cursor-grab"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                transformOrigin: 'center'
              }}
            >
              <img
                src={image}
                className="absolute inset-0 w-full h-full object-cover"
                alt="card"
                draggable={false}
              />

              {showHeatmap && heatmap && (
                <img
                  src={heatmap}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60"
                  alt="heatmap"
                />
              )}
            </div>

            {/* OVERLAY LAYER (FIXED) */}
            <div className="absolute inset-0 pointer-events-none">

              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-red-500/70 -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-red-500/70 -translate-y-1/2" />

              {showGrid && dims.width > 0 && dims.height > 0 && (
                <GridOverlay width={dims.width} height={dims.height} />
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  )
}