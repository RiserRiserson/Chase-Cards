'use client'

import { useRef, useState } from 'react'
import { UploadPanel, UploadPanelHandle } from './UploadPanel'
import { analyzeCardImage } from './utils/grading'
import { ImageViewer } from './ImageViewer'
import { CenteringOverlayWeb } from './CenteringOverlayWeb'
import { CornerInspector } from './CornerInspector'
import { SurfaceInspector } from './SurfaceInspector'

import type { SurfaceDefect } from './utils/grading/types'

type AnalysisModule =
  | 'none'
  | 'centering'
  | 'surface'
  | 'edges'
  | 'corners'

type GuideState = {
  v1: number
  v2: number
  v3: number
  v4: number
  h1: number
  h2: number
  h3: number
  h4: number
  mode: 'vertical' | 'horizontal'
}

export function CardAnalysisLayout() {
  const uploadRef = useRef<UploadPanelHandle | null>(null)

  // ✅ forces UploadPanel reset so file picker always works correctly
  const [uploadKey, setUploadKey] = useState(0)

  const [image, setImage] = useState<string | null>(null)

  const [surfaceScore, setSurfaceScore] = useState<number | null>(null)
  const [centerScore, setCenterScore] = useState<number | null>(null)
  const [edgesScore, setEdgesScore] = useState<number | null>(null)
  const [cornersScore, setCornersScore] = useState<number | null>(null)
  const [finalGrade, setFinalGrade] = useState<number | null>(null)

  const [surfaceDefects, setSurfaceDefects] = useState<SurfaceDefect[]>([])
  const [activeModule, setActiveModule] = useState<AnalysisModule>('none')

  const [guides, setGuides] = useState<GuideState>({
    v1: 20,
    v2: 30,
    v3: 50,
    v4: 60,
    h1: 20,
    h2: 30,
    h3: 50,
    h4: 60,
    mode: 'vertical'
  })

  // ---------------- ZOOM / PAN ----------------
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const panRef = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  const touchMode = useRef<'none' | 'pinch' | 'drag'>('none')
  const pinchStartDist = useRef(0)
  const pinchStartZoom = useRef(1)

  const setModule = (module: AnalysisModule) => {
    setActiveModule(prev => (prev === module ? 'none' : module))
  }

  const isActive = (module: AnalysisModule) => activeModule === module

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageUpload = (file: File, url: string) => {
    const img = new Image()
    img.src = url

    img.onload = () => {
      setImage(url)

      const result = analyzeCardImage(img)
      if (!result) return

      setSurfaceScore(result.surface.score)
      setCenterScore(result.centering.score)
      setEdgesScore(result.edges.score)
      setCornersScore(result.corners.score)
      setFinalGrade(result.finalGrade)

      setSurfaceDefects(result.surface.defects)
    }
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    panRef.current = { x: 0, y: 0 }
  }

  // ---------------- RE-SELECT CARD ----------------
  const handleChooseCard = () => {
    // reset upload component
    setUploadKey(k => k + 1)

    // reset analysis state
    setImage(null)
    setSurfaceScore(null)
    setCenterScore(null)
    setEdgesScore(null)
    setCornersScore(null)
    setFinalGrade(null)
    setSurfaceDefects([])

    resetView()

    // open file picker
    setTimeout(() => {
      uploadRef.current?.triggerFileSelect()
    }, 0)
  }

  // ---------------- EMPTY STATE ----------------
  if (!image) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Card Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select a card image to begin analysis
          </p>
        </div>

        <div className="border rounded-xl p-6 bg-card space-y-4">

          {/* KEY FIX: force reset capability */}
          <UploadPanel
            key={uploadKey}
            ref={uploadRef}
            onImageUpload={handleImageUpload}
          />

          <button
            onClick={() => uploadRef.current?.triggerFileSelect()}
            className="px-4 py-2 rounded bg-yellow-400 text-black font-medium hover:bg-yellow-300"
          >
            Choose Card
          </button>
        </div>
      </div>
    )
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="p-6 space-y-6">

      <div>
        <h2 className="text-2xl font-semibold">Card Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle grading modules
        </p>
      </div>

      {/* MODULE TOGGLES */}
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-card">
        {(['centering', 'surface', 'edges', 'corners'] as AnalysisModule[]).map(m => (
          <button
            key={m}
            onClick={() => setModule(m)}
            className={`px-3 py-1 text-sm border rounded ${
              isActive(m)
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'bg-card'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* VIEWPORT */}
      <div className="border rounded-xl p-6 bg-card">

        {/* ALWAYS WORKING RESELECT BUTTON */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleChooseCard}
            className="px-3 py-1 text-sm rounded bg-yellow-400 text-black"
          >
            Choose Card
          </button>

          <button
            onClick={resetView}
            className="px-3 py-1 text-sm rounded bg-black text-white"
          >
            Reset View
          </button>
        </div>

        <div className="overflow-auto">

          <div className="relative w-fit h-fit cursor-grab active:cursor-grabbing">

            <div
              onWheel={(e) => {
                e.preventDefault()

                setZoom(z => {
                  const next = z - e.deltaY * 0.001
                  return Math.min(4, Math.max(0.5, next))
                })
              }}

              onPointerDown={(e) => {
                dragging.current = true
                last.current = { x: e.clientX, y: e.clientY }
                touchMode.current = 'drag'
              }}

              onPointerMove={(e) => {
                const touches = (e as any).touches

                if (touches && touches.length === 2) {
                  const dx = touches[0].clientX - touches[1].clientX
                  const dy = touches[0].clientY - touches[1].clientY
                  const dist = Math.sqrt(dx * dx + dy * dy)

                  if (touchMode.current !== 'pinch') {
                    touchMode.current = 'pinch'
                    pinchStartDist.current = dist
                    pinchStartZoom.current = zoom
                    return
                  }

                  const scale = dist / pinchStartDist.current
                  const nextZoom = Math.min(
                    4,
                    Math.max(0.5, pinchStartZoom.current * scale)
                  )

                  setZoom(nextZoom)
                  return
                }

                if (!dragging.current) return

                const dx = e.clientX - last.current.x
                const dy = e.clientY - last.current.y

                last.current = { x: e.clientX, y: e.clientY }

                panRef.current = {
                  x: panRef.current.x + dx,
                  y: panRef.current.y + dy
                }

                setPan({ ...panRef.current })
              }}

              onPointerUp={() => {
                dragging.current = false
                touchMode.current = 'none'
              }}

              onPointerLeave={() => {
                dragging.current = false
                touchMode.current = 'none'
              }}
            >

              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center'
                }}
              >
                <ImageViewer image={image} />

                <div className="absolute inset-0">
                  {activeModule === 'centering' && (
                    <CenteringOverlayWeb
                      guides={guides}
                      setGuides={setGuides}
                    />
                  )}

                  {activeModule === 'surface' && (
                    <SurfaceInspector
                      image={image}
                      defects={surfaceDefects}
                    />
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* CORNERS */}
        {activeModule === 'corners' && (
          <div className="mt-4">
            <CornerInspector image={image} />
          </div>
        )}

        {/* SCORES */}
        <div className="mt-4 text-sm space-y-1">
          {activeModule === 'centering' && centerScore !== null && (
            <div>Centering: <b>{centerScore}/100</b></div>
          )}
          {activeModule === 'surface' && surfaceScore !== null && (
            <div>Surface: <b>{surfaceScore}/100</b></div>
          )}
          {activeModule === 'edges' && edgesScore !== null && (
            <div>Edges: <b>{edgesScore}/100</b></div>
          )}
          {activeModule === 'corners' && cornersScore !== null && (
            <div>Corners: <b>{cornersScore}/100</b></div>
          )}
          {finalGrade !== null && (
            <div className="text-lg mt-2">
              Final Grade: <b>{finalGrade}/10</b>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}