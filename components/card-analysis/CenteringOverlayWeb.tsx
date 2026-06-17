'use client'

import { useRef } from 'react'

type CenteringMode = 'vertical' | 'horizontal'

type GuideState = {
  v1: number
  v2: number
  v3: number
  v4: number
  h1: number
  h2: number
  h3: number
  h4: number
  mode: CenteringMode
}

type Props = {
  guides: GuideState
  setGuides: React.Dispatch<React.SetStateAction<GuideState>>
}

export function CenteringOverlayWeb({ guides, setGuides }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  const getPercent = (e: React.PointerEvent) => {
    if (!ref.current) return 0
    const rect = ref.current.getBoundingClientRect()

    return guides.mode === 'vertical'
      ? ((e.clientX - rect.left) / rect.width) * 100
      : ((e.clientY - rect.top) / rect.height) * 100
  }

  // ---------------- DRAG ----------------
  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.buttons || !ref.current) return

    const value = getPercent(e)

    setGuides(prev => {
      const isVertical = prev.mode === 'vertical'

      const keys: (keyof GuideState)[] = isVertical
        ? ['v1', 'v2', 'v3', 'v4']
        : ['h1', 'h2', 'h3', 'h4']

      const lines = keys.map(k => prev[k] as number)

      const closestIndex = lines
        .map(v => Math.abs(v - value))
        .indexOf(Math.min(...lines.map(v => Math.abs(v - value))))

      const key = keys[closestIndex]

      // ---------------- CONSTRAINT: OUTER MUST CONTAIN INNER ----------------
      const clamp = (v: number, min: number, max: number) =>
        Math.max(min + 1, Math.min(v, max - 1))

      if (isVertical) {
        if (key === 'v2' || key === 'v3') {
          const min = Math.min(prev.v1, prev.v4)
          const max = Math.max(prev.v1, prev.v4)
          return { ...prev, [key]: clamp(value, min, max) }
        }
      } else {
        if (key === 'h2' || key === 'h3') {
          const min = Math.min(prev.h1, prev.h4)
          const max = Math.max(prev.h1, prev.h4)
          return { ...prev, [key]: clamp(value, min, max) }
        }
      }

      return { ...prev, [key]: value }
    })
  }

  const outer = 'bg-blue-500'
  const inner = 'bg-green-500'

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20"
      onPointerMove={onPointerMove}
    >

      {/* VERTICAL */}
      {guides.mode === 'vertical' && (
        <>
          {(['v1', 'v2', 'v3', 'v4'] as const).map(k => {
            const pos = guides[k]
            const isOuter = k === 'v1' || k === 'v4'

            return (
              <div key={k} className="absolute top-0 bottom-0" style={{ left: `${pos}%` }}>
                <div className="absolute -left-4 w-8 h-full cursor-ew-resize" />
                <div className={`w-0.5 h-full ${isOuter ? outer : inner}`} />
              </div>
            )
          })}
        </>
      )}

      {/* HORIZONTAL */}
      {guides.mode === 'horizontal' && (
        <>
          {(['h1', 'h2', 'h3', 'h4'] as const).map(k => {
            const pos = guides[k]
            const isOuter = k === 'h1' || k === 'h4'

            return (
              <div key={k} className="absolute left-0 right-0" style={{ top: `${pos}%` }}>
                <div className="absolute -top-4 h-8 w-full cursor-ns-resize" />
                <div className={`h-0.5 w-full ${isOuter ? outer : inner}`} />
              </div>
            )
          })}
        </>
      )}

      {/* MODE TOGGLE */}
      <button
        onClick={() =>
          setGuides(prev => ({
            ...prev,
            mode: prev.mode === 'vertical' ? 'horizontal' : 'vertical'
          }))
        }
        className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded"
      >
        {guides.mode === 'horizontal' ? 'Vertical' : 'Horizontal'}
      </button>

    </div>
  )
}