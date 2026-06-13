export type OverlayType = 'heatmap' | 'points' | 'mask'

export type Point = {
  x: number
  y: number
  intensity?: number
}

export type LayerOverlay =
  | {
      type: 'heatmap'
      dataUrl: string
    }
  | {
      type: 'points'
      points: Point[]
    }
  | {
      type: 'mask'
      dataUrl: string
    }

export type GradingLayer = {
  score: number
  overlays: LayerOverlay[]
}

export type GradingResult = {
  centering: GradingLayer
  surface: GradingLayer
  edges: GradingLayer
  corners: GradingLayer
  finalGrade: number
}