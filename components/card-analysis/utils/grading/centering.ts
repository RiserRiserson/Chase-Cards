import { CenteringScore } from './types'

export function gradeCentering(
  img: HTMLImageElement
): CenteringScore {
  const left = 52
  const right = 48
  const top = 50
  const bottom = 50

  return {
    horizontal: {
      left,
      right,
      ratio: `${left}/${right}`
    },
    vertical: {
      top,
      bottom,
      ratio: `${top}/${bottom}`
    }
  }
}