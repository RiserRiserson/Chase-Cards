import {
  detectCardGeometry,
  CardGeometryResult
} from './utils/cardGeometry'

export type CardAnalysisPipelineResult = {
  geometry: CardGeometryResult
}

export async function runCardAnalysisPipeline(
  imageUrl: string
): Promise<CardAnalysisPipelineResult> {
  // STEP 1
  // Detect card geometry.
  // (Currently returns the full image.
  // Later this will perform real edge detection.)

  const geometry = await detectCardGeometry(imageUrl)

  return {
    geometry
  }
}