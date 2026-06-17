'use client'

import { useEffect, useState } from 'react'

type Props = {
  image: string
}

type Corner = {
  name: string
  x: number
  y: number
}

export function CornerInspector({ image }: Props) {
  const [corners, setCorners] = useState<string[]>([])

  useEffect(() => {
    const img = new Image()
    img.src = image

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const size = 250 // crop size per corner

      canvas.width = size
      canvas.height = size

      const drawCrop = (sx: number, sy: number) => {
        ctx.clearRect(0, 0, size, size)
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
        return canvas.toDataURL('image/png')
      }

      const w = img.width
      const h = img.height

      const cropSize = Math.min(w, h) * 0.25

      const results = [
        drawCrop(0, 0), // top left
        drawCrop(w - cropSize, 0), // top right
        drawCrop(0, h - cropSize), // bottom left
        drawCrop(w - cropSize, h - cropSize) // bottom right
      ]

      setCorners(results)
    }
  }, [image])

  if (!image) return null

  return (
    <div className="mt-4">
      <div className="text-sm font-medium mb-2">Corner Inspection</div>

      <div className="grid grid-cols-2 gap-2 max-w-75">
        {corners.map((c, i) => (
          <div key={i} className="border rounded overflow-hidden bg-black">
            <img src={c} alt={`corner-${i}`} className="w-full max-h-30 object-contain" />
          </div>
        ))}
      </div>
    </div>
  )
}