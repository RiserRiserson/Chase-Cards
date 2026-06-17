'use client'

import React from 'react'

type Props = {
  image: string | null
}

export function ImageViewer({ image }: { image: string }) {
  return (
    <div className="relative inline-block">
      <img
        src={image}
        style={{
          maxWidth: 600,   // adjust as needed (e.g. 500–800)
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  )
}