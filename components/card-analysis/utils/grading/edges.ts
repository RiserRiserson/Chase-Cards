import { EdgeScore, EdgePoint } from './types'

export function gradeEdges(img: HTMLImageElement): EdgeScore {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return {
      score: 0,
      top: [],
      bottom: [],
      left: [],
      right: []
    }
  }

  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)

  const w = img.width
  const h = img.height

  const segments = 50
  const strip = Math.max(4, Math.floor(Math.min(w, h) * 0.02))

  const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

  // ---------------- EDGE COMPARISON ----------------
  const sampleCompare = (
    outerX: number,
    outerY: number,
    innerX: number,
    innerY: number,
    width: number,
    height: number
  ) => {
    const outer = ctx.getImageData(outerX, outerY, width, height).data
    const inner = ctx.getImageData(innerX, innerY, width, height).data

    let outerSum = 0
    let innerSum = 0
    const count = outer.length / 4

    for (let i = 0; i < outer.length; i += 4) {
      const ob =
        (outer[i] + outer[i + 1] + outer[i + 2]) / 3
      const ib =
        (inner[i] + inner[i + 1] + inner[i + 2]) / 3

      outerSum += ob
      innerSum += ib
    }

    const outerMean = outerSum / count
    const innerMean = innerSum / count

    const diff = Math.abs(outerMean - innerMean)

    // normalize (tunable sensitivity)
    return clamp01(diff / 40)
  }

  const top: EdgePoint[] = []
  const bottom: EdgePoint[] = []
  const left: EdgePoint[] = []
  const right: EdgePoint[] = []

  // ---------------- TOP / BOTTOM ----------------
  for (let i = 0; i < segments; i++) {
    const x = (i / segments) * w
    const segW = w / segments

    const severityTop = sampleCompare(
      x,
      0,
      x,
      strip,
      segW,
      strip
    )

    const severityBottom = sampleCompare(
      x,
      Math.max(0, h - strip),
      x,
      Math.max(0, h - strip - strip),
      segW,
      strip
    )

    top.push({
      x: (x + segW / 2) / w,
      y: 0,
      severity: severityTop
    })

    bottom.push({
      x: (x + segW / 2) / w,
      y: 1,
      severity: severityBottom
    })
  }

  // ---------------- LEFT / RIGHT ----------------
  for (let i = 0; i < segments; i++) {
    const y = (i / segments) * h
    const segH = h / segments

    const severityLeft = sampleCompare(
      0,
      y,
      strip,
      y,
      strip,
      segH
    )

    const severityRight = sampleCompare(
      Math.max(0, w - strip),
      y,
      Math.max(0, w - strip - strip),
      y,
      strip,
      segH
    )

    left.push({
      x: 0,
      y: (y + segH / 2) / h,
      severity: severityLeft
    })

    right.push({
      x: 1,
      y: (y + segH / 2) / h,
      severity: severityRight
    })
  }

  // ---------------- SCORE ----------------
  const all = [...top, ...bottom, ...left, ...right]
  const avg =
    all.reduce((s, p) => s + p.severity, 0) / all.length

  const score = Math.max(0, 10 - avg * 10)

  return {
    score: Number(score.toFixed(2)),
    top,
    bottom,
    left,
    right
  }
}