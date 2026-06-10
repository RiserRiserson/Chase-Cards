'use client'

interface UploadPanelProps {
  onImageUpload: (file: File, url: string) => void
}

export function UploadPanel({ onImageUpload }: UploadPanelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    onImageUpload(file, url)
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  )
}