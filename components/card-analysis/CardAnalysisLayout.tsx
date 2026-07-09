'use client'

import { useRef, useState } from 'react'
import { UploadPanel, UploadPanelHandle } from './UploadPanel'
import { analyzeCardImage } from './utils/grading'
import { runCardAnalysisPipeline } from './cardAnalysisPipeline'
import { ImageViewer } from './ImageViewer'
import { CenteringOverlayWeb } from './CenteringOverlayWeb'
import { CornerInspector } from './CornerInspector'
import { SurfaceInspector } from './SurfaceInspector'
import { EdgeInspector } from './EdgeInspector'
import { CardIdentityPanel } from './CardIdentityPanel'
import { CardGeometryDebugPanel } from './CardGeometryDebugPanel'
import { CardGeometryOverlay } from './CardGeometryOverlay'

import type { SurfaceDefect } from './utils/grading/types'
import type { CardAnalysisPipelineResult } from './cardAnalysisPipeline'

type AnalysisModule =
  | 'none'
  | 'identify'
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

  const [uploadKey, setUploadKey] = useState(0)
  const [image, setImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] =
    useState<CardAnalysisPipelineResult | null>(null)

  const [surfaceScore, setSurfaceScore] = useState<number | null>(null)
  const [centering, setCentering] = useState<any | null>(null)
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
    mode: 'horizontal'
  })

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const panRef = useRef({ x: 0, y: 0 })

  const setModule = (module: AnalysisModule) => {
    setActiveModule(prev => (prev === module ? 'none' : module))
  }

  const isActive = (module: AnalysisModule) => activeModule === module

  const getModuleLabel = (module: AnalysisModule) => {
    if (module === 'identify') return 'Identify + Value'
    return module.charAt(0).toUpperCase() + module.slice(1)
  }

  const handleImageUpload = async (file: File, url: string) => {
    setImage(url)

    const pipelineResult = await runCardAnalysisPipeline(url)
    setAnalysisResult(pipelineResult)

    const img = new Image()
    img.src = pipelineResult.geometry.croppedImageUrl

    img.onload = () => {
      const result = analyzeCardImage(img)
      if (!result) return

      setSurfaceScore(result.surface.score)
      setCentering(result.centering)
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

  const resetAnalysis = () => {
    setUploadKey(k => k + 1)

    setImage(null)
    setAnalysisResult(null)
    setSurfaceScore(null)
    setCentering(null)
    setEdgesScore(null)
    setCornersScore(null)
    setFinalGrade(null)
    setSurfaceDefects([])
    setActiveModule('none')

    resetView()
  }

  const handleUploadImage = () => {
    resetAnalysis()

    setTimeout(() => {
      uploadRef.current?.triggerFileSelect()
    }, 0)
  }

  const handleTakePhoto = () => {
    resetAnalysis()

    setTimeout(() => {
      uploadRef.current?.triggerCameraSelect()
    }, 0)
  }

  if (!image) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Card Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Take a photo or upload a card image to begin
          </p>
        </div>

        <div className="border rounded-xl p-6 bg-card space-y-4">
          <UploadPanel
            key={uploadKey}
            ref={uploadRef}
            onImageUpload={handleImageUpload}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => uploadRef.current?.triggerCameraSelect()}
              className="w-full sm:w-auto px-4 py-3 rounded bg-yellow-400 text-black font-medium hover:bg-yellow-300"
            >
              Take Photo
            </button>

            <button
              onClick={() => uploadRef.current?.triggerFileSelect()}
              className="w-full sm:w-auto px-4 py-3 rounded bg-black text-white font-medium hover:bg-neutral-800"
            >
              Upload Image
            </button>
          </div>
        </div>
      </div>
    )
  }

  const displayedImage = analysisResult?.geometry.croppedImageUrl ?? image

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Card Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose an analysis option for this card
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-card">
        {(['identify', 'centering', 'surface', 'edges', 'corners'] as AnalysisModule[]).map(m => (
          <button
            key={m}
            onClick={() => setModule(m)}
            className={`px-3 py-1 text-sm border rounded ${
              isActive(m)
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'bg-card'
            }`}
          >
            {getModuleLabel(m)}
          </button>
        ))}
      </div>

      <div className="border rounded-xl p-6 bg-card">
        <UploadPanel
          key={uploadKey}
          ref={uploadRef}
          onImageUpload={handleImageUpload}
        />

        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={handleTakePhoto}
            className="px-3 py-1 text-sm rounded bg-yellow-400 text-black"
          >
            Take Photo
          </button>

          <button
            onClick={handleUploadImage}
            className="px-3 py-1 text-sm rounded bg-black text-white"
          >
            Upload Image
          </button>

          <button
            onClick={resetView}
            className="px-3 py-1 text-sm rounded border"
          >
            Reset View
          </button>
        </div>

        <div className="overflow-auto">
          <div className="relative w-fit h-fit cursor-grab active:cursor-grabbing">
            <div
              style={{
                transform: `scale(0.75)`,
                transformOrigin: 'top left'
              }}
            >
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center'
                }}
              >
                <div className="relative inline-block">
                  <ImageViewer image={displayedImage} />

                  <div className="absolute inset-0">
                    <CardGeometryOverlay result={analysisResult} />

                    {activeModule === 'centering' && (
                      <CenteringOverlayWeb
                        guides={guides}
                        setGuides={setGuides}
                      />
                    )}

                    {activeModule === 'surface' && (
                      <SurfaceInspector
                        image={displayedImage}
                        defects={surfaceDefects}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardGeometryDebugPanel result={analysisResult} />

        {activeModule === 'identify' && (
          <CardIdentityPanel />
        )}

        {activeModule === 'corners' && (
          <div className="mt-4">
            <CornerInspector image={displayedImage} />
          </div>
        )}

        {activeModule === 'edges' && (
          <div className="mt-4">
            <EdgeInspector image={displayedImage} />
          </div>
        )}

        <div className="mt-4 text-sm space-y-1">
          {activeModule === 'centering' && centering !== null && (
            <div className="space-y-1">
              <div>
                Horizontal: <b>{centering.horizontal.ratio}</b>
              </div>
              <div>
                Vertical: <b>{centering.vertical.ratio}</b>
              </div>
            </div>
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