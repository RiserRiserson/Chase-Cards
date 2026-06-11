'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Props {
  userId?: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type FormState = {
  full_card_name: string
  player: string
  year: string
  brand: string
  card_number: string
  set: string
  subset_parallel: string
  sport: string

  rookie: boolean
  autograph: boolean
  memorabilia: boolean
  game_used: boolean
  serial_numbered: boolean
  serial_number: string

  condition_purchased: string
  current_condition: string
  grading_company: string

  purchase_date: string
  purchase_from: string
  purchase_price: string

  estimated_value_cad: string
  value_date: string
}

export function AddCardModal({ userId, open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    full_card_name: '',
    player: '',
    year: '',
    brand: '',
    card_number: '',
    set: '',
    subset_parallel: '',
    sport: '',

    rookie: false,
    autograph: false,
    memorabilia: false,
    game_used: false,
    serial_numbered: false,
    serial_number: '',

    condition_purchased: '',
    current_condition: '',
    grading_company: '',

    purchase_date: '',
    purchase_from: '',
    purchase_price: '',

    estimated_value_cad: '',
    value_date: ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleAttr = (
    key: keyof Pick<
      FormState,
      'rookie' | 'autograph' | 'memorabilia' | 'game_used' | 'serial_numbered'
    >
  ) => {
    setForm(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const uploadImage = async (file: File) => {
    if (!userId) return ''

    const filePath = `${userId}/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('card-images')
      .upload(filePath, file)

    if (error) {
      console.error(error)
      return ''
    }

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

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const { error } = await supabase.from('cards').insert([
        {
          user_id: userId,

          full_card_name: form.full_card_name,
          player: form.player || null,
          year: form.year ? Number(form.year) : null,
          brand: form.brand || null,
          card_number: form.card_number || null,
          set: form.set || null,
          subset_parallel: form.subset_parallel || null,
          sport: form.sport || null,

          rookie: form.rookie,
          autograph: form.autograph,
          memorabilia: form.memorabilia,
          game_used: form.game_used,
          serial_numbered: form.serial_numbered,
          serial_number: form.serial_number || null,

          condition_purchased: form.condition_purchased || null,
          current_condition: form.current_condition || null,
          grading_company: form.grading_company || null,

          purchase_date: form.purchase_date || null,
          purchase_from: form.purchase_from || null,
          purchase_price: form.purchase_price
            ? Number(form.purchase_price)
            : null,

          estimated_value_cad: form.estimated_value_cad
            ? Number(form.estimated_value_cad)
            : null,

          value_date: form.value_date || null,

          card_sold: false,
          sales_date: null,
          sales_platform: null,
          sales_amount: null,
          fees: null,

          image_url: imageUrl || ''
        }
      ])

      if (error) {
        console.error(error)
        return
      }

      onSuccess()
      onClose()

      setForm({
        full_card_name: '',
        player: '',
        year: '',
        brand: '',
        card_number: '',
        set: '',
        subset_parallel: '',
        sport: '',

        rookie: false,
        autograph: false,
        memorabilia: false,
        game_used: false,
        serial_numbered: false,
        serial_number: '',

        condition_purchased: '',
        current_condition: '',
        grading_company: '',

        purchase_date: '',
        purchase_from: '',
        purchase_price: '',

        estimated_value_cad: '',
        value_date: ''
      })

      setImageFile(null)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  const attrButton = (
    key: keyof Pick<
      FormState,
      'rookie' | 'autograph' | 'memorabilia' | 'game_used' | 'serial_numbered'
    >,
    label: string,
    icon: string
  ) => {
    const active = form[key]

    return (
      <button
        type="button"
        onClick={() => toggleAttr(key)}
        className={`flex items-center gap-1 border px-2 py-1 text-sm rounded transition hover:opacity-90 active:scale-[0.98]
          ${
            active
              ? 'bg-primary text-black border-primary'
              : 'bg-muted text-muted-foreground border'
          }
        `}
      >
        <span className="text-xs leading-none">{icon}</span>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Add Card</h2>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto">

          {/* IDENTITY */}
          <input name="full_card_name" placeholder="Full Card Name" onChange={handleChange} className="w-full border p-2" />
          <input name="player" placeholder="Player" onChange={handleChange} className="w-full border p-2" />
          <input name="year" placeholder="Year" onChange={handleChange} className="w-full border p-2" />
          <input name="brand" placeholder="Brand" onChange={handleChange} className="w-full border p-2" />
          <input name="card_number" placeholder="Card Number" onChange={handleChange} className="w-full border p-2" />
          <input name="set" placeholder="Set" onChange={handleChange} className="w-full border p-2" />
          <input name="subset_parallel" placeholder="Subset / Parallel" onChange={handleChange} className="w-full border p-2" />
          <input name="sport" placeholder="Sport" onChange={handleChange} className="w-full border p-2" />

          {/* ATTRIBUTES */}
          <div className="flex flex-wrap gap-2 text-sm">
            {attrButton('rookie', 'Rookie', '🆕')}
            {attrButton('autograph', 'Auto', '✍️')}
            {attrButton('memorabilia', 'Mem', '🧵')}
            {attrButton('game_used', 'Game Used', '🎮')}
            {attrButton('serial_numbered', 'Serial', '#️⃣')}
          </div>

          <input name="serial_number" placeholder="Serial Number" onChange={handleChange} className="w-full border p-2" />

          {/* CONDITION */}
          <input name="condition_purchased" placeholder="Condition Purchased" onChange={handleChange} className="w-full border p-2" />
          <input name="current_condition" placeholder="Current Condition" onChange={handleChange} className="w-full border p-2" />
          <input name="grading_company" placeholder="Grading Company" onChange={handleChange} className="w-full border p-2" />

          {/* PURCHASE */}
          <input name="purchase_date" placeholder="Purchase Date" onChange={handleChange} className="w-full border p-2" />
          <input name="purchase_from" placeholder="Purchase From" onChange={handleChange} className="w-full border p-2" />
          <input name="purchase_price" placeholder="Purchase Price" onChange={handleChange} className="w-full border p-2" />

          {/* VALUE */}
          <input name="estimated_value_cad" placeholder="Estimated Value (CAD)" onChange={handleChange} className="w-full border p-2" />
          <input name="value_date" placeholder="Value Date" onChange={handleChange} className="w-full border p-2" />

          {/* IMAGE */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) setImageFile(e.target.files[0])
            }}
            className="w-full border p-2"
          />

        </div>

        <div className="p-6 border-t flex gap-2">
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