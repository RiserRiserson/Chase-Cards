import { SurfaceScore, SurfaceDefect } from './types'

/**
 * Surface grading v1 (upgraded + structured defects + clustering)
 *
 * Outputs:
 * - score (0–100 style internal normalized then converted upstream)
 * - defects (clustered + reusable for overlays)
 * - heatmap (visual overlay layer)
 */

export function gradeSurface(
  img: HTMLImageElement
): SurfaceScore & { heatmap: string } {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return {
      score: 0,
      defects: [],
      heatmap: ''
    }
  }

  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height

  canvas.width = width
  canvas.height = height

  // ---------------- DRAW IMAGE ----------------
  ctx.drawImage(img, 0, 0, width, height)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // ---------------- HEATMAP SETUP ----------------
  const heatCanvas = document.createElement('canvas')
  const heatCtx = heatCanvas.getContext('2d')

  heatCanvas.width = width
  heatCanvas.height = height

  if (!heatCtx) {
    return {
      score: 0,
      defects: [],
      heatmap: ''
    }
  }

  const heatData = heatCtx.createImageData(width, height)
  const heatPixels = heatData.data

  let totalVariance = 0
  let sampleCount = 0

  const defects: SurfaceDefect[] = []

  // reduced sampling density
  const step = 4 * 20

  // ---------------- ANALYSIS LOOP ----------------
  for (let i = 0; i < data.length - step; i += step) {
    const r1 = data[i]
    const g1 = data[i + 1]
    const b1 = data[i + 2]

    const r2 = data[i + step]
    const g2 = data[i + step + 1]
    const b2 = data[i + step + 2]

    const diff =
      Math.abs(r1 - r2) +
      Math.abs(g1 - g2) +
      Math.abs(b1 - b2)

    totalVariance += diff
    sampleCount++

    const pixelIndex = i

    const x = (i / 4) % width
    const y = Math.floor(i / 4 / width)

    // ---------------- DEFECT DETECTION ----------------
    if (diff > 220) {
      const severity = Math.min(1, diff / 255)

      defects.push({
        x: x / width,
        y: y / height,
        radius: 0.015 + severity * 0.04,
        severity
      })

      heatPixels[pixelIndex] = 255
      heatPixels[pixelIndex + 1] = 0
      heatPixels[pixelIndex + 2] = 0
      heatPixels[pixelIndex + 3] = 180
    } else {
      heatPixels[pixelIndex + 3] = 0
    }
  }

  // ---------------- DEFECT MERGING ----------------
  function mergeDefects(
    defects: SurfaceDefect[],
    threshold = 0.03
  ): SurfaceDefect[] {
    const merged: SurfaceDefect[] = []

    for (const d of defects) {
      let found = false

      for (const m of merged) {
        const dx = d.x - m.x
        const dy = d.y - m.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < threshold) {
          m.x = (m.x + d.x) / 2
          m.y = (m.y + d.y) / 2
          m.severity = Math.max(m.severity, d.severity)
          m.radius = Math.max(m.radius, d.radius)
          found = true
          break
        }
      }

      if (!found) merged.push({ ...d })
    }

    return merged
  }

  const mergedDefects = mergeDefects(defects)

  // ---------------- SCORE CALCULATION ----------------
  const avgVariance =
    sampleCount > 0 ? totalVariance / sampleCount : 0

  let score = 10 - avgVariance / 25
  score -= mergedDefects.length * 0.02

  if (score < 0) score = 0
  if (score > 10) score = 10

  // ---------------- EXPORT HEATMAP ----------------
  heatCtx.putImageData(heatData, 0, 0)
  const heatmap = heatCanvas.toDataURL('image/png')

  return {
    score: Number(score.toFixed(2)),
    defects: mergedDefects,
    heatmap
  }
}