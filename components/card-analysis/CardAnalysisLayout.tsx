'use client'

import { useState } from 'react'
import { UploadPanel } from './UploadPanel'
import { analyzeCardImage } from './utils/gradinghelpers'
import { ImageViewer } from './ImageViewer'

type AnalysisMode = {
  grid: boolean
  heatmap: boolean
  centering: boolean
  sharpness: boolean
  surface: boolean
}

export function CardAnalysisLayout() {
  const [image, setImage] = useState<string | null>(null)
  const [heatmap, setHeatmap] = useState<string | null>(null)

  const [centerScore, setCenterScore] = useState<number | null>(null)
  const [sharpnessScore, setSharpnessScore] = useState<number | null>(null)
  const [surfaceScore, setSurfaceScore] = useState<number | null>(null)
  const [finalGrade, setFinalGrade] = useState<number | null>(null)

  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>({
    grid: true,
    heatmap: true,
    centering: true,
    sharpness: true,
    surface: true
  })

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageUpload = (file: File, url: string) => {
    const img = new Image()
    img.src = url

    img.onload = () => {
      setImage(url)

      const result = analyzeCardImage(img)
      if (!result) return

      setCenterScore(result.center)
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

  // ---------------- EMPTY STATE ----------------
  if (!image) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Card Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a card to begin grading analysis
          </p>
        </div>

        <div className="border rounded-xl p-6 bg-card space-y-4">
          <UploadPanel onImageUpload={handleImageUpload} />

          <button
            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement | null)?.click()}
            className="px-4 py-2 rounded bg-yellow-400 text-black font-medium"
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

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Card Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle grading layers and visual analysis tools
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2">

        <button
          onClick={() => toggleMode('grid')}
          className={`px-3 py-1 text-sm rounded border ${
            analysisMode.grid ? 'bg-yellow-400 text-black' : 'bg-muted'
          }`}
        >
          Grid Overlay
        </button>

        <button
          onClick={() => toggleMode('heatmap')}
          className={`px-3 py-1 text-sm rounded border ${
            analysisMode.heatmap ? 'bg-yellow-400 text-black' : 'bg-muted'
          }`}
        >
          Heatmap
        </button>

        <button
          onClick={() => toggleMode('centering')}
          className={`px-3 py-1 text-sm rounded border ${
            analysisMode.centering ? 'bg-yellow-400 text-black' : 'bg-muted'
          }`}
        >
          Centering
        </button>

        <button
          onClick={() => toggleMode('sharpness')}
          className={`px-3 py-1 text-sm rounded border ${
            analysisMode.sharpness ? 'bg-yellow-400 text-black' : 'bg-muted'
          }`}
        >
          Sharpness
        </button>

        <button
          onClick={() => toggleMode('surface')}
          className={`px-3 py-1 text-sm rounded border ${
            analysisMode.surface ? 'bg-yellow-400 text-black' : 'bg-muted'
          }`}
        >
          Surface
        </button>
      </div>

      {/* MAIN PANEL */}
      <div className="border rounded-xl p-6 bg-card space-y-4">

        {/* VIEWER */}
        <ImageViewer
          image={image}
          heatmap={heatmap}
          showHeatmap={analysisMode.heatmap}
          showGrid={analysisMode.grid}
        />

        {/* SCORES */}
        <div className="space-y-1 text-sm">

          {analysisMode.centering && centerScore !== null && (
            <div>Centering: <b>{centerScore}/100</b></div>
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