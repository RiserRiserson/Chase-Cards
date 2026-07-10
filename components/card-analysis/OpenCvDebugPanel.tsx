'use client'

import { useEffect, useState } from 'react'
import { verifyOpenCv } from './utils/openCvService'

type OpenCvStatus = 'loading' | 'ready' | 'error'

export function OpenCvDebugPanel() {
  const [status, setStatus] = useState<OpenCvStatus>('loading')

  useEffect(() => {
    let cancelled = false

    const checkOpenCv = async () => {
      const isReady = await verifyOpenCv()

      if (cancelled) return

      setStatus(isReady ? 'ready' : 'error')
    }

    checkOpenCv()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mt-4 rounded-lg border p-4 bg-card text-sm space-y-3">
      <h3 className="font-semibold text-base">
        OpenCV Debug
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div>OpenCV Status</div>

        <div>
          {status === 'loading' && (
            <b className="text-muted-foreground">
              Loading...
            </b>
          )}

          {status === 'ready' && (
            <b className="text-green-600">
              Loaded
            </b>
          )}

          {status === 'error' && (
            <b className="text-red-600">
              Failed
            </b>
          )}
        </div>

        <div>Matrix Test</div>

        <div>
          {status === 'loading' && <b>--</b>}
          {status === 'ready' && <b>Passed</b>}
          {status === 'error' && <b>Failed</b>}
        </div>
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-600">
          OpenCV could not initialize. Check the browser console for details.
        </p>
      )}
    </div>
  )
}