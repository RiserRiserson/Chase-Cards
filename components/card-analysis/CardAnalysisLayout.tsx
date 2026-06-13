'use client'

import { useRef, useState } from 'react'
import { UploadPanel, UploadPanelHandle } from './UploadPanel'
import { analyzeCardImage } from './utils/grading'
import { ImageViewer } from './ImageViewer'
import { CenteringOverlayWeb } from './CenteringOverlayWeb'

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

  const [image, setImage] = useState<string | null>(null)

  // PIPELINE RESULTS
  const [surfaceScore, setSurfaceScore] = useState<number | null>(null)
  const [centerScore, setCenterScore] = useState<number | null>(null)
  const [edgesScore, setEdgesScore] = useState<number | null>(null)
  const [cornersScore, setCornersScore] = useState<number | null>(null)
  const [finalGrade, setFinalGrade] = useState<number | null>(null)

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

  const [zoom, setZoom] = useState(1)

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
    }
  }

  // ---------------- MODULE TOGGLE ----------------
  const setModule = (module: AnalysisModule) => {
    setActiveModule(prev => (prev === module ? 'none' : module))
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
          <UploadPanel
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

        <button
          onClick={() => setModule('centering')}
          className="px-3 py-1 text-sm border rounded"
        >
          Centering
        </button>

        <button
          onClick={() => setModule('surface')}
          className="px-3 py-1 text-sm border rounded"
        >
          Surface
        </button>

        <button
          onClick={() => setModule('edges')}
          className="px-3 py-1 text-sm border rounded"
        >
          Edges
        </button>

        <button
          onClick={() => setModule('corners')}
          className="px-3 py-1 text-sm border rounded"
        >
          Corners
        </button>

        {/* ZOOM */}
        <div className="ml-auto flex gap-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>-</button>
          <button onClick={() => setZoom(1)}>Reset</button>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.1))}>+</button>
        </div>

      </div>

      {/* IMAGE VIEWPORT */}
      <div className="border rounded-xl p-6 bg-card">
        <div className="overflow-auto">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
          >

            <ImageViewer image={image} />

            {activeModule === 'centering' && (
              <CenteringOverlayWeb
                guides={guides}
                setGuides={setGuides}
              />
            )}

          </div>
        </div>

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