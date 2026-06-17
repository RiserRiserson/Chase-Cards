export function analyzeCardImage(img: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const width = img.width
  const height = img.height

  canvas.width = width
  canvas.height = height

  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const heatCanvas = document.createElement('canvas')
  heatCanvas.width = width
  heatCanvas.height = height
  const heatCtx = heatCanvas.getContext('2d')
  if (!heatCtx) return null

  let leftWeight = 0
  let rightWeight = 0
  let topWeight = 0
  let bottomWeight = 0

  let edgeStrength = 0
  let surfaceNoise = 0
  let pixelCount = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const brightness = (r + g + b) / 3

    const pixelIndex = i / 4
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)

    if (x < width / 2) leftWeight += brightness
    else rightWeight += brightness

    if (y < height / 2) topWeight += brightness
    else bottomWeight += brightness

    if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
      const right =
        (data[i + 4] + data[i + 5] + data[i + 6]) / 3

      const bottom =
        (data[i + width * 4] +
          data[i + width * 4 + 1] +
          data[i + width * 4 + 2]) / 3

      const diff =
        Math.abs(brightness - right) +
        Math.abs(brightness - bottom)

      edgeStrength += diff

      const localVariance =
        Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)

      surfaceNoise += localVariance

      const intensity = Math.min(255, localVariance * 4)

      heatCtx.fillStyle = `rgba(255, 0, 0, ${intensity / 255})`
      heatCtx.fillRect(x, y, 1, 1)

      pixelCount++
    }
  }

  // ---------------- CENTRING (PROPORTIONAL OUTPUT) ----------------

  const horizontalTotal = leftWeight + rightWeight || 1
  const verticalTotal = topWeight + bottomWeight || 1

  const horizontal = {
    left: Math.round((leftWeight / horizontalTotal) * 100),
    right: Math.round((rightWeight / horizontalTotal) * 100)
  }

  const vertical = {
    top: Math.round((topWeight / verticalTotal) * 100),
    bottom: Math.round((bottomWeight / verticalTotal) * 100)
  }

  // ---------------- EDGE / SURFACE METRICS ----------------

  const avgEdge = edgeStrength / (pixelCount || 1)
  const sharpness = Math.min(100, (avgEdge / 35) * 100)

  const avgSurface = surfaceNoise / (pixelCount || 1)
  const surface = Math.max(0, 100 - avgSurface / 2)

  // ---------------- FINAL GRADE ----------------

  const centerQuality =
    ((100 - Math.abs(horizontal.left - 50) * 2) +
      (100 - Math.abs(vertical.top - 50) * 2)) /
    2

  const grade =
    (centerQuality / 100) * 0.45 +
    (sharpness / 100) * 0.35 +
    (surface / 100) * 0.2

  return {
    horizontal,
    vertical,
    sharpness: Math.round(sharpness),
    surface: Math.round(surface),
    finalGrade: Number(grade.toFixed(1)),
    heatmap: heatCanvas.toDataURL()
  }
}