export type CenteringScore = {
  horizontal: {
    left: number
    right: number
    ratio: string
  }
  vertical: {
    top: number
    bottom: number
    ratio: string
  }
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

export type EdgePoint = {
  x: number   // 0–1 normalized across image width
  y: number   // 0–1 normalized across image height
  severity: number // 0–1
}

export type EdgeScore = {
  score: number

  top: EdgePoint[]
  bottom: EdgePoint[]
  left: EdgePoint[]
  right: EdgePoint[]
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