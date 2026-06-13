'use client'

import { useZoomPan } from './hooks/useZoomPan'

interface ImageViewerProps {
  image: string
}

export function ImageViewer({ image }: ImageViewerProps) {
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
      </div>

    </div>
  )
}