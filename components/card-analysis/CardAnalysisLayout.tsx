'use client'

import { useRef, useState } from 'react'
import { UploadPanel, UploadPanelHandle } from './UploadPanel'
import { analyzeCardImage } from './utils/gradinghelpers'
import { ImageViewer } from './ImageViewer'
import { CenteringOverlayWeb } from './CenteringOverlayWeb'

type AnalysisMode = {
  grid: boolean
  heatmap: boolean
  centering: boolean
  sharpness: boolean
  surface: boolean
}

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

type CenteringScore = {
  width: {
    left: number
    right: number
  }
  height: {
    top: number
    bottom: number
  }
}

export function CardAnalysisLayout() {
  const uploadRef = useRef<UploadPanelHandle | null>(null)

  const [image, setImage] = useState<string | null>(null)
  const [heatmap, setHeatmap] = useState<string | null>(null)

  const [centerScore, setCenterScore] = useState<CenteringScore | null>(null)
  const [sharpnessScore, setSharpnessScore] = useState<number | null>(null)
  const [surfaceScore, setSurfaceScore] = useState<number | null>(null)
  const [finalGrade, setFinalGrade] = useState<number | null>(null)

  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>({
    grid: false,
    heatmap: false,
    centering: false,
    sharpness: false,
    surface: false
  })

  // ---------------- CENTERING GUIDES ----------------
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

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageUpload = (file: File, url: string) => {
    const img = new Image()
    img.src = url

    img.onload = () => {
      setImage(url)

      const result = analyzeCardImage(img)
      if (!result) return

      setSharpnessScore(result.sharpness)
      setSurfaceScore(result.surface)
      setFinalGrade(result.finalGrade)
      setHeatmap(result.heatmap)
    }
  }

  const getLetterGrade = (score: number) => {
    if (score >= 9) return 'A+'
    if (score >= 8) return 'A'
    if (score >= 7) return 'B'
    if (score >= 6) return 'C'
    if (score >= 5) return 'D'
    return 'F'
  }

  const toggleMode = (key: keyof AnalysisMode) => {
    setAnalysisMode(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // ---------------- CENTERING CALCULATION ----------------
  const calculateCenterScore = (g: GuideState): CenteringScore => {
    const vOuterMin = Math.min(g.v1, g.v4)
    const vOuterMax = Math.max(g.v1, g.v4)

    const vLeft = g.v2 - vOuterMin
    const vRight = vOuterMax - g.v3

    const vTotal = vLeft + vRight

    const leftPct = vTotal > 0 ? Math.round((vLeft / vTotal) * 100) : 50
    const rightPct = 100 - leftPct

    const hOuterMin = Math.min(g.h1, g.h4)
    const hOuterMax = Math.max(g.h1, g.h4)

    const hTop = g.h2 - hOuterMin
    const hBottom = hOuterMax - g.h3

    const hTotal = hTop + hBottom

    const topPct = hTotal > 0 ? Math.round((hTop / hTotal) * 100) : 50
    const bottomPct = 100 - topPct

    return {
      width: {
        left: leftPct,
        right: rightPct
      },
      height: {
        top: topPct,
        bottom: bottomPct
      }
    }
  }

  // ---------------- GUIDE UPDATE WRAPPER ----------------
  const updateGuides = (value: React.SetStateAction<GuideState>) => {
    setGuides(prev => {
      const next =
        typeof value === 'function'
          ? (value as (p: GuideState) => GuideState)(prev)
          : value

      setCenterScore(calculateCenterScore(next))
      return next
    })
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
            className="px-4 py-2 rounded bg-yellow-400 text-black font-medium hover:bg-yellow-300 transition"
          >
            Choose Card
          </button>

          <p className="text-sm text-muted-foreground">
            No card selected
          </p>
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
          Toggle grading layers and visual analysis tools
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-card">

        <button onClick={() => toggleMode('grid')} className={`px-3 py-1 text-sm rounded border ${analysisMode.grid ? 'bg-yellow-400 text-black' : 'bg-muted'}`}>Grid</button>
        <button onClick={() => toggleMode('heatmap')} className={`px-3 py-1 text-sm rounded border ${analysisMode.heatmap ? 'bg-yellow-400 text-black' : 'bg-muted'}`}>Heatmap</button>
        <button onClick={() => toggleMode('centering')} className={`px-3 py-1 text-sm rounded border ${analysisMode.centering ? 'bg-yellow-400 text-black' : 'bg-muted'}`}>Centering</button>
        <button onClick={() => toggleMode('sharpness')} className={`px-3 py-1 text-sm rounded border ${analysisMode.sharpness ? 'bg-yellow-400 text-black' : 'bg-muted'}`}>Sharpness</button>
        <button onClick={() => toggleMode('surface')} className={`px-3 py-1 text-sm rounded border ${analysisMode.surface ? 'bg-yellow-400 text-black' : 'bg-muted'}`}>Surface</button>

      </div>

      <div className="border rounded-xl p-6 bg-card space-y-4">

        <div className="relative">
          <ImageViewer
            image={image}
            heatmap={heatmap}
            showHeatmap={analysisMode.heatmap}
            showGrid={analysisMode.grid}
          />

          {analysisMode.centering && (
            <CenteringOverlayWeb
              guides={guides}
              setGuides={updateGuides}
            />
          )}
        </div>

        {/* SCORES (SAFE RENDERING) */}
        <div className="space-y-2 text-sm">

          {analysisMode.centering && centerScore?.width && centerScore?.height && (
            <>
              <div>
                Width: <b>{centerScore.width.left} / {centerScore.width.right}</b>
              </div>

              <div>
                Height: <b>{centerScore.height.top} / {centerScore.height.bottom}</b>
              </div>
            </>
          )}

          {analysisMode.sharpness && sharpnessScore !== null && (
            <div>Sharpness: <b>{sharpnessScore}/100</b></div>
          )}

          {analysisMode.surface && surfaceScore !== null && (
            <div>Surface: <b>{surfaceScore}/100</b></div>
          )}

          {finalGrade !== null && (
            <div className="text-lg mt-2">
              Final Grade: <b>{finalGrade}/10 ({getLetterGrade(finalGrade)})</b>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}