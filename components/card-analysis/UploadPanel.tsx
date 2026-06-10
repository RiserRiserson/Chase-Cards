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
}

export const UploadPanel = forwardRef<UploadPanelHandle, UploadPanelProps>(
  ({ onImageUpload }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Expose method to parent component
    useImperativeHandle(ref, () => ({
      triggerFileSelect: () => {
        inputRef.current?.click()
      }
    }))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const url = URL.createObjectURL(file)
      onImageUpload(file, url)

      // allow re-uploading same file
      e.target.value = ''
    }

    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    )
  }
)

UploadPanel.displayName = 'UploadPanel'