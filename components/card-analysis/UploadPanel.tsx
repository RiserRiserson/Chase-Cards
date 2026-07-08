'use client'

import {
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react'

interface UploadPanelProps {
  onImageUpload: (file: File, url: string) => void
}

export type UploadPanelHandle = {
  triggerFileSelect: () => void
  triggerCameraSelect: () => void
}

export const UploadPanel = forwardRef<UploadPanelHandle, UploadPanelProps>(
  ({ onImageUpload }, ref) => {
    const uploadInputRef = useRef<HTMLInputElement | null>(null)
    const cameraInputRef = useRef<HTMLInputElement | null>(null)

    useImperativeHandle(ref, () => ({
      triggerFileSelect: () => {
        uploadInputRef.current?.click()
      },
      triggerCameraSelect: () => {
        cameraInputRef.current?.click()
      }
    }))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const url = URL.createObjectURL(file)
      onImageUpload(file, url)

      e.target.value = ''
    }

    return (
      <div>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    )
  }
)

UploadPanel.displayName = 'UploadPanel'