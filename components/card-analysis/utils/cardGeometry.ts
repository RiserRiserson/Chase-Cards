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
 * First version:
 * Uses the full uploaded image as the card boundary.
 *
 * This gives us a shared geometry structure now, then we can replace
 * the detection logic later with real edge/corner detection without
 * changing every grading module.
 */
export async function detectCardGeometry(
  imageUrl: string
): Promise<CardGeometryResult> {
  const image = await loadImage(imageUrl)

  const corners: CardCorners = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: image.naturalWidth, y: 0 },
    bottomRight: { x: image.naturalWidth, y: image.naturalHeight },
    bottomLeft: { x: 0, y: image.naturalHeight }
  }

  return {
    originalWidth: image.naturalWidth,
    originalHeight: image.naturalHeight,
    corners,
    croppedImageUrl: imageUrl,
    cropWidth: image.naturalWidth,
    cropHeight: image.naturalHeight
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