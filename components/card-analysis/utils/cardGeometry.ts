export type Point = {
  x: number
  y: number
}

export type CardCorners = {
  topLeft: Point
  topRight: Point
  bottomRight: Point
  bottomLeft: Point
}

export type CardGeometryResult = {
  originalWidth: number
  originalHeight: number
  corners: CardCorners
  croppedImageUrl: string
  cropWidth: number
  cropHeight: number
}

/**
 * Safe first-pass crop:
 * Removes a small outer margin from the uploaded image.
 *
 * This proves the shared geometry pipeline can replace the displayed image
 * with a processed/cropped image before we add real card edge detection.
 */
export async function detectCardGeometry(
  imageUrl: string
): Promise<CardGeometryResult> {
  const image = await loadImage(imageUrl)

  const originalWidth = image.naturalWidth
  const originalHeight = image.naturalHeight

  const marginX = Math.round(originalWidth * 0.05)
  const marginY = Math.round(originalHeight * 0.05)

  const cropX = marginX
  const cropY = marginY
  const cropWidth = originalWidth - marginX * 2
  const cropHeight = originalHeight - marginY * 2

  const corners: CardCorners = {
    topLeft: { x: cropX, y: cropY },
    topRight: { x: cropX + cropWidth, y: cropY },
    bottomRight: { x: cropX + cropWidth, y: cropY + cropHeight },
    bottomLeft: { x: cropX, y: cropY + cropHeight }
  }

  const croppedImageUrl = cropImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  )

  return {
    originalWidth,
    originalHeight,
    corners,
    croppedImageUrl,
    cropWidth,
    cropHeight
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function cropImage(
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return image.src

  ctx.drawImage(
    image,
    x,
    y,
    width,
    height,
    0,
    0,
    width,
    height
  )

  return canvas.toDataURL('image/jpeg', 0.92)
}