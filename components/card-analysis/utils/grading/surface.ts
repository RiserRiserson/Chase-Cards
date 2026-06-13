import { SurfaceScore } from './types'

/**
 * Surface grading v1
 * Goal: detect visible imperfections / noise / blur proxies
 *
 * NOTE: This is a starter heuristic implementation.
 * Later upgrades can replace this with pixel variance / edge noise mapping.
 */
export function gradeSurface(img: HTMLImageElement): SurfaceScore {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return {
      score: 0,
      defects: 0
    }
  }

  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height

  canvas.width = width
  canvas.height = height

  ctx.drawImage(img, 0, 0, width, height)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  let totalVariance = 0
  let sampleCount = 0
  let defectCount = 0

  // sample pixels (downsample for performance)
  const step = 4 * 6

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

    // simple defect heuristic threshold
    if (diff > 120) {
      defectCount++
    }
  }

  const avgVariance = sampleCount > 0 ? totalVariance / sampleCount : 0

  // normalize score (tunable)
  let score = 10 - avgVariance / 25

  // penalize defects
  score -= defectCount * 0.02

  if (score < 0) score = 0
  if (score > 10) score = 10

  return {
    score: Number(score.toFixed(2)),
    defects: defectCount
  }
}