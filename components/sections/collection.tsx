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

  rookie?: boolean
  autograph?: boolean
  memorabilia?: boolean
  serial_numbered?: boolean
  serial_number?: string

  purchase_price?: number
  sold?: boolean
}

export function CollectionSection({ userId }: { userId?: string }) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState<number>(0)

  const [confirmDelete, setConfirmDelete] = useState(false)

  // ACCORDION STATE
  const [openSections, setOpenSections] = useState({
    identity: true,
    attributes: false,
    condition: false,
    purchase: false
  })

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const Chevron = ({ open }: { open: boolean }) => (
    <span className="text-xs">{open ? '▼' : '▶'}</span>
  )

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

    const { error } = await supabase.storage
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

      {/* HEADER */}
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
              viewMode === 'grid' ? 'bg-primary text-white' : 'bg-muted'
            }`}
          >
            Grid
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'list' ? 'bg-primary text-white' : 'bg-muted'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cards.map(card => (
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
              <div className="flex-7 bg-muted overflow-hidden">
                {card.image_url ? (
                  <img src={card.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-3 p-2">
                <div className="font-medium text-sm truncate">{card.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {card.game} • {card.set_name ?? card.set}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {cards.map(card => (
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
                    <img src={card.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs flex items-center justify-center h-full">No</span>
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

      {/* SIDE DRAWER */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex">

          <div
            className="flex-1 bg-black/60"
            onClick={() => {
              setSelectedCard(null)
              setConfirmDelete(false)
              setEditMode(false)
            }}
          />

          <div
            className="w-full max-w-md h-full bg-background shadow-2xl flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >

            {selectedCard.image_url && (
              <div className="w-full max-h-[40vh] bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={selectedCard.image_url}
                  className="max-h-[40vh] w-auto object-contain"
                />
              </div>
            )}

            <div className="p-3 border-b">
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* IDENTITY */}
              <div>
                <button
                  onClick={() => toggleSection('identity')}
                  className="w-full flex justify-between text-sm font-semibold text-muted-foreground uppercase"
                >
                  <span>Identity</span>
                  <Chevron open={openSections.identity} />
                </button>

                {openSections.identity && (
                  <div className="text-sm space-y-1 pl-2 pt-2">
                    <div>{selectedCard.name}</div>
                    <div>{selectedCard.game}</div>
                    <div>{selectedCard.set_name ?? selectedCard.set}</div>
                  </div>
                )}
              </div>

              {/* ATTRIBUTES */}
              <div>
                <button
                  onClick={() => toggleSection('attributes')}
                  className="w-full flex justify-between text-sm font-semibold text-muted-foreground uppercase"
                >
                  <span>Attributes</span>
                  <Chevron open={openSections.attributes} />
                </button>

                {openSections.attributes && (
                  <div className="text-sm space-y-1 pl-2 pt-2">
                    <div>Rookie: {selectedCard.rookie ? 'Yes' : '—'}</div>
                    <div>Auto: {selectedCard.autograph ? 'Yes' : '—'}</div>
                    <div>Mem: {selectedCard.memorabilia ? 'Yes' : '—'}</div>
                    <div>
                      Serial: {selectedCard.serial_numbered ? selectedCard.serial_number : '—'}
                    </div>
                  </div>
                )}
              </div>

              {/* PURCHASE */}
              <div>
                <button
                  onClick={() => toggleSection('purchase')}
                  className="w-full flex justify-between text-sm font-semibold text-muted-foreground uppercase"
                >
                  <span>Purchase</span>
                  <Chevron open={openSections.purchase} />
                </button>

                {openSections.purchase && (
                  <div className="text-sm space-y-1 pl-2 pt-2">
                    <div>Price: ${selectedCard.purchase_price ?? '—'}</div>
                  </div>
                )}
              </div>

              {/* CONDITION */}
              <div>
                <button
                  onClick={() => toggleSection('condition')}
                  className="w-full flex justify-between text-sm font-semibold text-muted-foreground uppercase"
                >
                  <span>Condition</span>
                  <Chevron open={openSections.condition} />
                </button>

                {openSections.condition && (
                  <div className="text-sm text-muted-foreground pl-2 pt-2">
                    Not tracked yet
                  </div>
                )}
              </div>

            </div>

            <div className="flex p-3 border-t gap-2">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Save' : 'Edit'}
              </button>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 text-red-500"
                >
                  🗑️
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs px-2 py-1 bg-muted rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => deleteCard(selectedCard.id)}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Confirm
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}