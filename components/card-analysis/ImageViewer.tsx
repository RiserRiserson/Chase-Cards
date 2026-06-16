'use client'

interface ImageViewerProps {
  image: string
}

export function ImageViewer({ image }: ImageViewerProps) {
  return (
    <div className="relative border rounded-xl overflow-hidden bg-muted w-sm">
      <img
        src={image}
        className="block w-sm max-w-sm h-auto"
        alt="card"
        draggable={false}
      />
    </div>
  )
}