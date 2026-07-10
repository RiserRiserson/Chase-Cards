'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from './collection/card'
import { CollectionModal } from './collection/collection-modal'
import { exportCollection } from './collection/exportCollection'
import { downloadCollectionTemplate } from './collection/downloadCollectionTemplate'

type VisibleSections = {
  identity: boolean
  attributes: boolean
  condition: boolean
  purchase: boolean
  value: boolean
}

const defaultVisibleSections: VisibleSections = {
  identity: true,
  attributes: true,
  condition: true,
  purchase: true,
  value: true
}

export function CollectionSection({ userId }: { userId?: string }) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)

  /* ---------------- MODAL STATE ---------------- */
  const [editCard, setEditCard] = useState<CardItem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* ---------------- COLLECTION TOOLS ---------------- */
  const [toolsOpen, setToolsOpen] = useState(false)

  const [visibleSections, setVisibleSections] =
    useState<VisibleSections>(() => {
      if (typeof window === 'undefined') {
        return defaultVisibleSections
      }

      const saved = localStorage.getItem('collection_visible_sections')

      if (!saved) {
        return defaultVisibleSections
      }

      try {
        return JSON.parse(saved) as VisibleSections
      } catch {
        return defaultVisibleSections
      }
    })

  useEffect(() => {
    localStorage.setItem(
      'collection_visible_sections',
      JSON.stringify(visibleSections)
    )
  }, [visibleSections])

  const toggleSectionVisibility = (key: keyof VisibleSections) => {
    setVisibleSections(previous => ({
      ...previous,
      [key]: !previous[key]
    }))
  }

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
      console.error('Unable to load collection:', error)
      setLoading(false)
      return
    }

    setCards((data as CardItem[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    void fetchCards()
  }, [userId])

  /* ---------------- SAVE EDIT ---------------- */
  const saveCard = async (updated: CardItem) => {
    const { error } = await supabase
      .from('cards')
      .update(updated)
      .eq('id', updated.id)

    if (error) {
      console.error('Unable to save card:', error)
      return
    }

    setCards(previous =>
      previous.map(card => (card.id === updated.id ? updated : card))
    )

    setSelectedCard(previous =>
      previous?.id === updated.id ? updated : previous
    )

    setEditCard(null)
  }

  /* ---------------- DELETE ---------------- */
  const confirmDelete = async (id: string) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Unable to delete card:', error)
      return
    }

    setCards(previous => previous.filter(card => card.id !== id))

    setSelectedCard(previous =>
      previous?.id === id ? null : previous
    )

    setEditCard(previous =>
      previous?.id === id ? null : previous
    )

    setDeleteConfirmId(null)
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Collection</h2>

          <p className="text-sm text-muted-foreground">
            {cards.length} cards
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* COLLECTION TOOLS DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen(previous => !previous)}
              className="rounded bg-primary px-3 py-2 text-sm text-black"
            >
              Collection Tools
              <span className="ml-2 text-xs">
                {toolsOpen ? '▲' : '▼'}
              </span>
            </button>

            {toolsOpen && (
  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded border bg-background shadow-lg">
    <button
      type="button"
      disabled={cards.length === 0}
      onClick={() => {
        exportCollection(cards)
        setToolsOpen(false)
      }}
      className="block w-full px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      Export Collection
    </button>

    <button
      type="button"
      onClick={() => {
        downloadCollectionTemplate()
        setToolsOpen(false)
      }}
      className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
    >
      Download Template
    </button>
  </div>
)}
          </div>

          {/* SECTION VISIBILITY BUTTONS */}
          <div className="flex flex-wrap justify-end gap-2 text-xs">
            {Object.entries(visibleSections).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  toggleSectionVisibility(key as keyof VisibleSections)
                }
                className={`rounded border px-2 py-1 ${
                  value
                    ? 'bg-primary text-black'
                    : 'bg-muted text-gray-500'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="border rounded-xl overflow-hidden bg-card">
        {cards.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No cards have been added yet.
          </div>
        ) : (
          cards.map(card => {
            const isOpen = selectedCard?.id === card.id

            return (
              <div
                key={card.id}
                className="border-b last:border-b-0"
              >
                {/* ROW */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCard(isOpen ? null : card)
                  }
                  className="w-full grid grid-cols-[80px_2fr_80px_2fr_2fr_120px_120px] gap-3 px-4 py-3 items-center hover:bg-muted/30 text-left"
                >
                  <div className="w-14 h-14 rounded border bg-muted overflow-hidden">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={
                          card.full_card_name ??
                          card.player ??
                          'Trading card'
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[10px] flex items-center justify-center h-full">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="font-medium text-sm truncate">
                    {card.player ??
                      card.full_card_name ??
                      'Unnamed Card'}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {card.year ?? '—'}
                  </div>

                  <div className="text-sm truncate">
                    {card.set ?? '—'}
                  </div>

                  <div className="text-sm truncate">
                    {card.brand ?? '—'}
                  </div>

                  <div className="flex gap-2 text-xs">
                    {card.rookie && (
                      <span className="border px-1 rounded text-[10px]">
                        RC
                      </span>
                    )}

                    {card.autograph && (
                      <span className="border px-1 rounded text-[10px]">
                        AUTO
                      </span>
                    )}

                    {card.memorabilia && (
                      <span className="border px-1 rounded text-[10px]">
                        MEM
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-right">
                    ${card.estimated_value_cad ?? 0}
                  </div>
                </button>

                {/* ACTIONS */}
                <div className="flex gap-2 px-4 pb-2">
                  <button
                    type="button"
                    className="text-xs px-2 py-1 border rounded"
                    onClick={() => setEditCard(card)}
                  >
                    Edit
                  </button>

                  {deleteConfirmId === card.id ? (
                    <>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                        onClick={() => confirmDelete(card.id)}
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        className="text-xs px-2 py-1 border rounded"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="text-xs px-2 py-1 border rounded text-red-500"
                      onClick={() => setDeleteConfirmId(card.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* EXPANDED DETAILS */}
                {isOpen && (
                  <div className="p-5 bg-muted/20 space-y-6">
                    <div className="p-3 border rounded bg-background">
                      <div className="font-semibold text-sm">
                        {card.full_card_name ?? 'Unnamed Card'}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {visibleSections.identity && (
                        <div className="border rounded p-3 bg-background">
                          <div className="text-xs font-semibold uppercase mb-2">
                            Identity
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>Year: {card.year ?? '—'}</div>
                            <div>Brand: {card.brand ?? '—'}</div>
                            <div>Player: {card.player ?? '—'}</div>
                            <div>
                              Card #: {card.card_number ?? '—'}
                            </div>
                            <div>Set: {card.set ?? '—'}</div>
                            <div>
                              Parallel: {card.subset_parallel ?? '—'}
                            </div>
                            <div>Sport: {card.sport ?? '—'}</div>
                          </div>
                        </div>
                      )}

                      {visibleSections.attributes && (
                        <div className="border rounded p-3 bg-background">
                          <div className="text-xs font-semibold uppercase mb-2">
                            Attributes
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              Rookie: {card.rookie ? 'Yes' : '—'}
                            </div>
                            <div>
                              Autograph:{' '}
                              {card.autograph ? 'Yes' : '—'}
                            </div>
                            <div>
                              Memorabilia:{' '}
                              {card.memorabilia ? 'Yes' : '—'}
                            </div>
                            <div>
                              Game Used:{' '}
                              {card.game_used ? 'Yes' : '—'}
                            </div>
                            <div>
                              Serial:{' '}
                              {card.serial_numbered
                                ? card.serial_number ?? 'Yes'
                                : '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {visibleSections.condition && (
                        <div className="border rounded p-3 bg-background">
                          <div className="text-xs font-semibold uppercase mb-2">
                            Condition
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              Purchased:{' '}
                              {card.condition_purchased ?? '—'}
                            </div>
                            <div>
                              Current:{' '}
                              {card.current_condition ?? '—'}
                            </div>
                            <div>
                              Grading:{' '}
                              {card.grading_company ?? '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {visibleSections.purchase && (
                        <div className="border rounded p-3 bg-background">
                          <div className="text-xs font-semibold uppercase mb-2">
                            Purchase
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              Date: {card.purchase_date ?? '—'}
                            </div>
                            <div>
                              From: {card.purchase_from ?? '—'}
                            </div>
                            <div>
                              Price: ${card.purchase_price ?? 0}
                            </div>
                          </div>
                        </div>
                      )}

                      {visibleSections.value && (
                        <div className="border rounded p-3 bg-background md:col-span-2">
                          <div className="text-xs font-semibold uppercase mb-2">
                            Value &amp; Sales
                          </div>

                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div>
                              Estimated Value: $
                              {card.estimated_value_cad ?? 0}
                            </div>

                            <div>
                              Value Date: {card.value_date ?? '—'}
                            </div>

                            <div>
                              Sold: {card.card_sold ? 'Yes' : 'No'}
                            </div>

                            <div>
                              Sale Date: {card.sales_date ?? '—'}
                            </div>

                            <div>
                              Platform:{' '}
                              {card.sales_platform ?? '—'}
                            </div>

                            <div>
                              Sale Price: ${card.sales_amount ?? 0}
                            </div>

                            <div>
                              Fees: ${card.fees ?? 0}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* FULL EDIT MODAL */}
      {editCard && (
        <CollectionModal
          editCard={editCard}
          setEditCard={setEditCard}
          onSave={saveCard}
          onClose={() => setEditCard(null)}
        />
      )}
    </div>
  )
}