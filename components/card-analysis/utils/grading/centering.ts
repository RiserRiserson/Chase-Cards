import { CenteringScore } from './types'

export function gradeCentering(img: HTMLImageElement): CenteringScore {
  // placeholder logic (replace later with real detection)
  const left = 52
  const right = 48
  const top = 50
  const bottom = 50

  const score = 10 - Math.abs(left - right) * 0.1 - Math.abs(top - bottom) * 0.1

  return {
    score: Math.max(0, Number(score.toFixed(2))),
    width: { left, right },
    height: { top, bottom }
  }
}