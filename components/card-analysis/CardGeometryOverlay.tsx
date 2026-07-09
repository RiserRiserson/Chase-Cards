'use client'

import type { CardAnalysisPipelineResult } from './cardAnalysisPipeline'

interface Props {
  result: CardAnalysisPipelineResult | null
}

export function CardGeometryOverlay({ result }: Props) {
  if (!result) return null

  const { geometry } = result
  const { corners, originalWidth, originalHeight } = geometry

  const left = (corners.topLeft.x / originalWidth) * 100
  const top = (corners.topLeft.y / originalHeight) * 100
  const right = (corners.topRight.x / originalWidth) * 100
  const bottom = (corners.bottomLeft.y / originalHeight) * 100

  const width = right - left
  const height = bottom - top

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute border-2 border-yellow-400 rounded"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`
        }}
      />

      {Object.entries(corners).map(([key, point]) => (
        <div
          key={key}
          className="absolute w-3 h-3 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(point.x / originalWidth) * 100}%`,
            top: `${(point.y / originalHeight) * 100}%`
          }}
        />
      ))}
    </div>
  )
}