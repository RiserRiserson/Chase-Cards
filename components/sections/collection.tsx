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

  const [confirmDelete, setConfirmDelete] = useState(false)

  // VIEW MODE (persisted)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window === 'undefined') return 'list'
    return (localStorage.getItem('collection_view_mode') as 'grid' | 'list') || 'list'
  })

  useEffect(() => {
    localStorage.setItem('collection_view_mode', viewMode)
  }, [viewMode])

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

    setCards((data as CardItem[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCards()
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`collection-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `user_id=eq.${userId}`
        },
        () => fetchCards()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
    setConfirmDelete(false)
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
    setEditMode(false)
    fetchCards()
  }

  const handleImageUpload = async (file: File) => {
    if (!selectedCard) return

    const filePath = `${selectedCard.id}-${Date.now()}`

    const { error: uploadError } = await supabase.storage
      .from('card-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error(uploadError)
      return
    }

    const { data } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath)

    const imageUrl = data.publicUrl

    await supabase
      .from('cards')
      .update({ image_url: imageUrl })
      .eq('id', selectedCard.id)

    setSelectedCard({ ...selectedCard, image_url: imageUrl })
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading collection...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER + TOGGLE */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Collection</h2>
          <p className="text-sm text-muted-foreground">
            {cards.length} cards
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'bg-muted'
            }`}
          >
            Grid
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-muted'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

          {cards.map((card) => (
            <div
              key={card.id}
              className="border rounded-xl bg-card overflow-hidden cursor-pointer hover:shadow-lg transition flex flex-col aspect-[2.2/3.2]"
              onClick={() => {
                setSelectedCard(card)
                setEditValue(card.market_value ?? 0)
                setEditMode(false)
                setConfirmDelete(false)
              }}
            >
              <div className="flex-[7] bg-muted overflow-hidden">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-[3] p-2 flex flex-col justify-between">
                <div>
                  <div className="font-medium text-sm truncate">
                    {card.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {card.game} • {card.set_name ?? card.set ?? 'Unknown Set'}
                  </div>
                </div>

                <div className="flex justify-between text-xs mt-2">
                  <span>${card.market_value ?? 0}</span>
                  <span>Qty {card.quantity ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-2">

          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                setSelectedCard(card)
                setEditValue(card.market_value ?? 0)
                setEditMode(false)
                setConfirmDelete(false)
              }}
              className="flex items-center justify-between p-3 border rounded bg-card hover:bg-muted cursor-pointer"
            >
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs flex items-center justify-center h-full">
                      No
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium">{card.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {card.game} • {card.set_name ?? card.set}
                  </div>
                </div>

              </div>

              <div className="text-right text-sm">
                <div>${card.market_value ?? 0}</div>
                <div className="text-xs text-muted-foreground">
                  Qty {card.quantity ?? 0}
                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedCard(null)
            setConfirmDelete(false)
          }}
        >
          <div
            className="bg-background w-full max-w-md rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {selectedCard.image_url && (
              <div className="w-full max-h-[50vh] bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={selectedCard.image_url}
                  alt={selectedCard.name}
                  className="max-h-[50vh] w-auto object-contain"
                />
              </div>
            )}

            <div className="p-3 border-b">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              />
            </div>

            <div className="p-5 space-y-4">

              <div>
                <h3 className="text-lg font-semibold">{selectedCard.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCard.game} • {selectedCard.set_name ?? selectedCard.set}
                </p>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value</span>

                {editMode ? (
                  <input
                    className="border rounded px-2 py-1 w-28 text-right"
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                  />
                ) : (
                  <span>${selectedCard.market_value ?? 0}</span>
                )}
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span>{selectedCard.quantity ?? 0}</span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between pt-3">

                <button
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                  onClick={() => {
                    if (editMode) saveEdit()
                    else setEditMode(true)
                  }}
                >
                  {editMode ? 'Save' : 'Edit'}
                </button>

                <div className="ml-3 flex items-center gap-2">

                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs px-2 py-1 rounded bg-muted"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => deleteCard(selectedCard.id)}
                        className="text-xs px-2 py-1 rounded bg-red-600 text-white"
                      >
                        Confirm
                      </button>
                    </>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}