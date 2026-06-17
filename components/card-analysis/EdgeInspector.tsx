'use client'

import { useEffect, useState } from 'react'

type Props = {
  image: string
}

export function EdgeInspector({ image }: Props) {
  const [edges, setEdges] = useState<{
    north: string
    south: string
    west: string
    east: string
  } | null>(null)

  useEffect(() => {
    if (!image) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = img.width
      const h = img.height

      const strip = Math.floor(Math.min(w, h) * 0.18)

      const drawCrop = (
        sx: number,
        sy: number,
        sw: number,
        sh: number
      ) => {
        canvas.width = sw
        canvas.height = sh

        ctx.clearRect(0, 0, sw, sh)
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)

        return canvas.toDataURL('image/png')
      }

      const north = drawCrop(0, 0, w, strip)
      const south = drawCrop(0, h - strip, w, strip)
      const west = drawCrop(0, 0, strip, h)
      const east = drawCrop(w - strip, 0, strip, h)

      setEdges({ north, south, west, east })
    }
  }, [image])

  if (!image || !edges) return null

  return (
    <div className="mt-4">
      <div className="text-sm font-medium mb-3">
        Edge Inspection
      </div>

      <div className="flex flex-col items-center gap-4">

        {/* NORTH */}
        <div className="w-full border rounded overflow-hidden bg-black">
          <img
            src={edges.north}
            className="w-full max-h-25 object-contain"
            alt="north-edge"
          />
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-2 gap-4 w-full">

          {/* WEST */}
          <div className="border rounded overflow-hidden bg-black">
            <img
              src={edges.west}
              className="w-full max-h-25 object-contain"
              alt="west-edge"
            />
          </div>

          {/* EAST */}
          <div className="border rounded overflow-hidden bg-black">
            <img
              src={edges.east}
              className="w-full max-h-25 object-contain"
              alt="east-edge"
            />
          </div>
        </div>

        {/* SOUTH */}
        <div className="w-full border rounded overflow-hidden bg-black">
          <img
            src={edges.south}
            className="w-full max-h-25 object-contain"
            alt="south-edge"
          />
        </div>

      </div>
    </div>
  )
}