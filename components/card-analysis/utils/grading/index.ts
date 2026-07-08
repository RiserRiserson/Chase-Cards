import { gradeCentering } from './centering'
import { gradeSurface } from './surface'
import { gradeEdges } from './edges'
import { gradeCorners } from './corners'
import { GradingResult } from './types'

export function analyzeCardImage(
  img: HTMLImageElement
): GradingResult {
  const centering = gradeCentering(img)
  const surface = gradeSurface(img)
  const edges = gradeEdges(img)
  const corners = gradeCorners(img)

  // ---------------- SAFE COMPAT LAYER ----------------
  const c: any = centering

  const horizontalLeft =
    c.horizontal?.left ??
    c.width?.left ??
    50

  const horizontalRight =
    c.horizontal?.right ??
    c.width?.right ??
    50

  const verticalTop =
    c.vertical?.top ??
    c.height?.top ??
    50

  const verticalBottom =
    c.vertical?.bottom ??
    c.height?.bottom ??
    50

  // ---------------- CENTRING SCORE BRIDGE ----------------
  const horizontalPenalty = Math.abs(horizontalLeft - 50)
  const verticalPenalty = Math.abs(verticalTop - 50)

  const centeringScore =
    Math.max(
      0,
      100 - (horizontalPenalty + verticalPenalty) * 2
    ) / 10

  // ---------------- FINAL GRADE ----------------
  const finalGrade =
    centeringScore * 0.3 +
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