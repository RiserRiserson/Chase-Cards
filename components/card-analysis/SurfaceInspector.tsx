'use client'

import React from 'react'

type SurfaceDefect = {
  x: number
  y: number
  radius: number
  severity: number
}

type Props = {
  image: string
  defects?: SurfaceDefect[]   // IMPORTANT: optional
}

export function SurfaceInspector({ defects = [] }: Props) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    >
      {defects.map((d, i) => {
        const left = `${d.x * 100}%`
        const top = `${d.y * 100}%`

        const size = `${Math.max(6, d.radius * 200)}px`

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: size,
              height: size,
              transform: 'translate(-50%, -50%)',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 0, 0, 0.35)',
              border: '2px solid rgba(255, 0, 0, 0.7)'
            }}
          />
        )
      })}
    </div>
  )
}