'use client'

import { GridOverlay } from './grid-overlay'
import { useZoomPan } from './hooks/useZoomPan'

interface ImageViewerProps {
  image: string
  heatmap?: string | null
  showHeatmap: boolean
  showGrid: boolean
}

export function ImageViewer({
  image,
  heatmap,
  showHeatmap,
  showGrid
}: ImageViewerProps) {
  const {
    offsetX,
    offsetY,
    scale,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useZoomPan()

  return (
    <div className="relative border rounded-xl overflow-hidden bg-muted w-full max-w-sm aspect-2.5/3.5">

      {/* IMAGE LAYER */}
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

      {/* OVERLAY LAYER */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 bottom-0 w-2px bg-red-500/70 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 right-0 h-2px bg-red-500/70 -translate-y-1/2" />

        {showGrid && (
          <div className="absolute inset-0">
            <GridOverlay />
          </div>
        )}
      </div>
    </div>
  )
}