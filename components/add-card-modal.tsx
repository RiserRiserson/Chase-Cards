'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Props {
  userId?: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddCardModal({ userId, open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: '',
    game: '',
    set: '',
    year: '',
    condition: 'mint',
    marketValue: '',
    purchasePrice: '',
    quantity: '1',
    rarity: ''
  })

  // ✅ NEW: image state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ✅ upload helper
  const uploadImage = async (file: File) => {
    const filePath = `${userId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('card-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async () => {
    if (!userId) return

    setUploading(true)

    try {
      let imageUrl = ''

      // ✅ upload image first if exists
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const { error } = await supabase.from('cards').insert([
        {
          name: form.name,
          game: form.game,
          set: form.set,
          year: form.year ? Number(form.year) : null,
          condition: form.condition,
          market_value: form.marketValue ? Number(form.marketValue) : 0,
          purchase_price: form.purchasePrice ? Number(form.purchasePrice) : 0,
          quantity: form.quantity ? Number(form.quantity) : 1,
          rarity: form.rarity,
          image_url: imageUrl,
          user_id: userId
        }
      ])

      if (error) {
        console.error(error)
        return
      }

      onSuccess()
      onClose()

      // reset
      setForm({
        name: '',
        game: '',
        set: '',
        year: '',
        condition: 'mint',
        marketValue: '',
        purchasePrice: '',
        quantity: '1',
        rarity: ''
      })
      setImageFile(null)

    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-3">

        <h2 className="text-lg font-semibold">Add Card</h2>

        <input name="name" placeholder="Name" onChange={handleChange} className="w-full border p-2" />
        <input name="game" placeholder="Game" onChange={handleChange} className="w-full border p-2" />
        <input name="set" placeholder="Set" onChange={handleChange} className="w-full border p-2" />
        <input name="year" placeholder="Year" onChange={handleChange} className="w-full border p-2" />
        <input name="marketValue" placeholder="Market Value" onChange={handleChange} className="w-full border p-2" />
        <input name="purchasePrice" placeholder="Purchase Price" onChange={handleChange} className="w-full border p-2" />
        <input name="rarity" placeholder="Rarity" onChange={handleChange} className="w-full border p-2" />

        {/* ✅ NEW IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setImageFile(e.target.files[0])
            }
          }}
          className="w-full border p-2"
        />

        <div className="flex gap-2 pt-2">

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 bg-blue-600 text-white p-2 rounded"
          >
            {uploading ? 'Uploading...' : 'Save'}
          </button>

          <button onClick={onClose} className="flex-1 bg-gray-300 p-2 rounded">
            Cancel
          </button>

        </div>

      </div>
    </div>
  )
}