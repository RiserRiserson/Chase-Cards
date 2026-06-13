import { gradeCentering } from './centering'
import { gradeSurface } from './surface'
import { gradeEdges } from './edges'
import { gradeCorners } from './corners'
import { GradingResult } from './types'

export function analyzeCardImage(img: HTMLImageElement): GradingResult {
  const centering = gradeCentering(img)
  const surface = gradeSurface(img)
  const edges = gradeEdges(img)
  const corners = gradeCorners(img)

  const finalGrade =
    centering.score * 0.3 +
    surface.score * 0.3 +
    edges.score * 0.2 +
    corners.score * 0.2

  const heatmap = null

  return {
    centering,
    surface,
    edges,
    corners,
    finalGrade: Number(finalGrade.toFixed(2)),
    heatmap
  }
}