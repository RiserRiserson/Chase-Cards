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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!userId) return

    const { error } = await supabase.from('cards').insert([
      {
        name: form.name,
        game: form.game,
        set: form.set,
        year: Number(form.year),
        condition: form.condition,
        market_value: Number(form.marketValue),
        purchase_price: Number(form.purchasePrice),
        quantity: Number(form.quantity),
        rarity: form.rarity,
        user_id: userId
      }
    ])

    if (error) {
      console.error(error)
      return
    }

    onSuccess()
    onClose()
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

        <div className="flex gap-2 pt-2">
          <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white p-2 rounded">
            Save
          </button>

          <button onClick={onClose} className="flex-1 bg-gray-300 p-2 rounded">
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}