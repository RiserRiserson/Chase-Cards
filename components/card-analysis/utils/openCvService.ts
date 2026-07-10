declare global {
  interface Window {
    cv?: any
  }
}

type OpenCvInstance = any

let openCvPromise: Promise<OpenCvInstance> | null = null

export function loadOpenCv(): Promise<OpenCvInstance> {
  if (openCvPromise) {
    return openCvPromise
  }

  openCvPromise = initializeOpenCv()
  return openCvPromise
}

async function initializeOpenCv(): Promise<OpenCvInstance> {
  if (typeof window === 'undefined') {
    throw new Error('OpenCV can only be initialized in the browser.')
  }

  if (window.cv?.Mat) {
    return window.cv
  }

  await loadOpenCvScript()

  const cv = window.cv

  if (!cv) {
    throw new Error('OpenCV script loaded, but window.cv is unavailable.')
  }

  if (cv.Mat) {
    return cv
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error('OpenCV initialization timed out.'))
    }, 15000)

    cv.onRuntimeInitialized = () => {
      window.clearTimeout(timeout)
      resolve()
    }
  })

  if (!cv.Mat) {
    throw new Error('OpenCV initialized, but the Mat API is unavailable.')
  }

  return cv
}

function loadOpenCvScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-opencv-loader="true"]'
    )

    if (existingScript) {
      if (window.cv) {
        resolve()
        return
      }

      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load OpenCV script.')),
        { once: true }
      )

      return
    }

    const script = document.createElement('script')
    script.src = '/opencv/opencv.js'
    script.async = true
    script.dataset.opencvLoader = 'true'

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load OpenCV script.'))

    document.body.appendChild(script)
  })
}

export async function verifyOpenCv(): Promise<boolean> {
  try {
    const cv = await loadOpenCv()

    const testMatrix = new cv.Mat(1, 1, cv.CV_8UC1)
    testMatrix.delete()

    return true
  } catch (error) {
    console.error('OpenCV verification failed:', error)
    return false
  }
}