'use client'

import type { CardAnalysisPipelineResult } from './cardAnalysisPipeline'

interface Props {
  result: CardAnalysisPipelineResult | null
}

export function CardGeometryDebugPanel({ result }: Props) {
  if (!result) return null

  const g = result.geometry

  return (
    <div className="mt-4 rounded-lg border p-4 bg-card text-sm space-y-3">
      <h3 className="font-semibold text-base">
        Geometry Debug
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div>
          Original Width
        </div>
        <div>
          <b>{g.originalWidth}px</b>
        </div>

        <div>
          Original Height
        </div>
        <div>
          <b>{g.originalHeight}px</b>
        </div>

        <div>
          Crop Width
        </div>
        <div>
          <b>{g.cropWidth}px</b>
        </div>

        <div>
          Crop Height
        </div>
        <div>
          <b>{g.cropHeight}px</b>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="font-medium mb-2">
          Detected Corners
        </div>

        <pre className="text-xs overflow-auto">
{JSON.stringify(g.corners, null, 2)}
        </pre>
      </div>

      <div className="border-t pt-3">
        <div>
          Cropped Image
        </div>

        <img
          src={g.croppedImageUrl}
          alt="Detected card"
          className="mt-2 max-w-xs rounded border"
        />
      </div>
    </div>
  )
}