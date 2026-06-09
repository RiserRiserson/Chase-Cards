'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type CardItem = {
  id: string

  // IDENTITY
  full_card_name?: string
  year?: number
  brand?: string
  player?: string
  card_number?: string
  subset_parallel?: string
  sport?: string

  // LEGACY / COMPATIBILITY
  name: string
  game: string
  set_name?: string
  set?: string

  // ATTRIBUTES
  rookie?: boolean
  serial_numbered?: boolean
  serial_number?: string
  memorabilia?: boolean
  game_used?: boolean
  autograph?: boolean

  // CONDITION
  condition_purchased?: string
  current_condition?: string
  grading_company?: string

  // PURCHASE
  purchase_date?: string
  purchase_from?: string
  purchase_price?: number

  // VALUE
  estimated_value_cad?: number
  value_date?: string
  sales_history_query?: string

  // SALES
  card_sold?: boolean
  sales_date?: string
  sales_platform?: string
  sales_amount?: number
  fees?: number

  // IMAGE
  image_url?: string

  // LEGACY VALUE FIELDS
  market_value: number
  quantity: number
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

  if (error) {
    console.error(error)
    return
  }

  const { data } = supabase.storage
    .from('card-images')
    .getPublicUrl(filePath)

  const imageUrl = data.publicUrl

  const { error: updateError } = await supabase
    .from('cards')
    .update({ image_url: imageUrl })
    .eq('id', selectedCard.id)

  if (updateError) {
    console.error(updateError)
    return
  }

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
          <h2 className="text-2xl font-semibold">Collection</h2>
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
  <div className="border rounded-xl overflow-hidden bg-card">

    {/* HEADER */}
    <div className="grid grid-cols-[40px_80px_2fr_1fr_1fr_100px_80px] gap-3 px-4 py-3 border-b bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">

      <div></div>
      <div>Image</div>
      <div>Name</div>
      <div>Game</div>
      <div>Set</div>
      <div>Value</div>
      <div>Qty</div>

    </div>

    {/* ROWS */}
    {cards.map(card => {
      const isOpen = selectedCard?.id === card.id

      return (
        <div
          key={card.id}
          className="border-b last:border-b-0"
        >

          {/* MAIN ROW */}
          <button
            onClick={() => {
              if (isOpen) {
                setSelectedCard(null)
                return
              }

              setSelectedCard(card)
              setEditValue(card.market_value ?? 0)
              setEditMode(false)
              setConfirmDelete(false)
            }}
            className="w-full grid grid-cols-[40px_80px_2fr_1fr_1fr_100px_80px] gap-3 px-4 py-3 items-center hover:bg-muted/30 transition text-left"
          >

            {/* CHEVRON */}
            <div className="text-xs text-muted-foreground">
              {isOpen ? '▼' : '▶'}
            </div>

            {/* IMAGE */}
            <div className="w-14 h-14 rounded border overflow-hidden bg-muted">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                  No Img
                </div>
              )}
            </div>

            {/* NAME */}
            <div>
              <div className="font-medium text-sm">
                {card.name}
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {card.rookie && 'RC '}
                {card.autograph && 'AUTO '}
                {card.memorabilia && 'MEM '}
              </div>
            </div>

            {/* GAME */}
            <div className="text-sm">
              {card.game}
            </div>

            {/* SET */}
            <div className="text-sm truncate">
              {card.set_name ?? card.set}
            </div>

            {/* VALUE */}
            <div className="text-sm font-medium">
              ${card.market_value ?? 0}
            </div>

            {/* QUANTITY */}
            <div className="text-sm">
              {card.quantity ?? 0}
            </div>

          </button>

          {/* EXPANDED CONTENT */}
          {isOpen && (
            <div className="border-t bg-muted/20 p-5">

              <div className="grid md:grid-cols-[220px_1fr] gap-6">

                {/* IMAGE + UPLOAD */}
                <div className="space-y-3">

                  <div className="aspect-2.5/3.5 rounded-lg overflow-hidden border bg-muted">
                    {selectedCard?.image_url ? (
                      <img
                        src={selectedCard.image_url}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />

                </div>

                {/* DETAILS */}
                <div className="space-y-6">

                  {/* IDENTITY */}
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Identity
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>{selectedCard?.name}</div>
                      <div>{selectedCard?.game}</div>
                      <div>{selectedCard?.set_name ?? selectedCard?.set}</div>
                    </div>
                  </div>

                  {/* ATTRIBUTES */}
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Attributes
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>Rookie: {selectedCard?.rookie ? 'Yes' : '—'}</div>
                      <div>Autograph: {selectedCard?.autograph ? 'Yes' : '—'}</div>
                      <div>Memorabilia: {selectedCard?.memorabilia ? 'Yes' : '—'}</div>
                      <div>
                        Serial:
                        {' '}
                        {selectedCard?.serial_numbered
                          ? selectedCard.serial_number
                          : '—'}
                      </div>
                    </div>
                  </div>

                  {/* PURCHASE */}
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Purchase
                    </div>

                    <div className="text-sm">
                      ${selectedCard?.purchase_price ?? '—'}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">

                    <button
                      className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? 'Save' : 'Edit'}
                    </button>

                    {!confirmDelete ? (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="px-4 py-2 rounded border text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-4 py-2 rounded border text-sm"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => deleteCard(selectedCard!.id)}
                          className="px-4 py-2 rounded bg-red-600 text-white text-sm"
                        >
                          Confirm Delete
                        </button>
                      </>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )
    })}

  </div>
)}

    </div>
  )
}