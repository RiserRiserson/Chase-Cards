export type CenteringScore = {
  score: number
  width: { left: number; right: number }
  height: { top: number; bottom: number }
}

export type SurfaceDefect = {
  x: number
  y: number
  radius: number
  severity: number
}

export type SurfaceScore = {
  score: number
  defects: SurfaceDefect[]
}

export type EdgeScore = {
  score: number
}

export type CornerScore = {
  score: number
}

export type GradingResult = {
  centering: CenteringScore
  surface: SurfaceScore
  edges: EdgeScore
  corners: CornerScore
  finalGrade: number
  heatmap: string | null
}