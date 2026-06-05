'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type CardItem = {
  id: string
  name: string
  game: string
  set_name?: string
  set?: string
  market_value: number
  quantity: number
  image_url?: string
}

export function CollectionSection({ userId }: { userId?: string }) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState<number>(0)

  const fetchCards = async () => {
    if (!userId) {
      setCards([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })

    if (error) {
      console.error('Collection fetch error:', error)
      setLoading(false)
      return
    }

    setCards(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCards()
  }, [userId])

  const deleteCard = async (id: string) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return
    }

    setSelectedCard(null)
    fetchCards()
  }

  const saveEdit = async () => {
    if (!selectedCard) return

    const { error } = await supabase
      .from('cards')
      .update({ market_value: editValue })
      .eq('id', selectedCard.id)

    if (error) {
      console.error('Update error:', error)
      return
    }

    setSelectedCard(null)
    fetchCards()
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading collection...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Collection</h2>
        <p className="text-sm text-muted-foreground">
          {cards.length} cards
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        {cards.map((card) => (
          <div
            key={card.id}
            className="border rounded-lg p-4 bg-card hover:shadow-md transition cursor-pointer"
            onClick={() => {
              setSelectedCard(card)
              setEditValue(card.market_value)
              setEditMode(false)
            }}
          >

            {/* IMAGE PLACEHOLDER */}
            <div className="h-32 w-full bg-muted rounded mb-3 flex items-center justify-center text-xs text-muted-foreground">
              {card.image_url ? 'Image' : 'No Image'}
            </div>

            {/* NAME */}
            <div className="font-medium truncate">
              {card.name}
            </div>

            {/* SET */}
            <div className="text-xs text-muted-foreground">
              {card.game} • {card.set_name ?? card.set ?? 'Unknown Set'}
            </div>

            {/* VALUE */}
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Value</span>
              <span className="font-medium">${card.market_value}</span>
            </div>

            {/* QTY */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Qty</span>
              <span>{card.quantity}</span>
            </div>

          </div>
        ))}

      </div>

      {/* MODAL */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-background w-full max-w-md rounded-lg p-6 space-y-4">

            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedCard.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCard.game} • {selectedCard.set_name ?? selectedCard.set}
                </p>
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                className="text-sm text-muted-foreground"
              >
                ✕
              </button>
            </div>

            {/* DETAILS */}
            <div className="space-y-3 text-sm">

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Value</span>

                {editMode ? (
                  <input
                    className="border rounded px-2 py-1 w-24 text-right"
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                  />
                ) : (
                  <span>${selectedCard.market_value}</span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>{selectedCard.quantity}</span>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-4">

              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded"
                onClick={() => {
                  if (editMode) {
                    saveEdit()
                  } else {
                    setEditMode(true)
                  }
                }}
              >
                {editMode ? 'Save' : 'Edit'}
              </button>

              <button
                className="flex-1 bg-red-600 text-white py-2 rounded"
                onClick={() => deleteCard(selectedCard.id)}
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}