'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from './collection/card'

type VisibleSections = {
  identity: boolean
  attributes: boolean
  condition: boolean
  purchase: boolean
  value: boolean
}

export function CollectionSection({ userId }: { userId?: string }) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)

  /* ---------------- MODAL STATE ---------------- */
  const [editCard, setEditCard] = useState<CardItem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [visibleSections, setVisibleSections] = useState<VisibleSections>(() => {
    if (typeof window === 'undefined') {
      return {
        identity: true,
        attributes: true,
        condition: true,
        purchase: true,
        value: true
      }
    }

    const saved = localStorage.getItem('collection_visible_sections')

    return saved
      ? JSON.parse(saved)
      : {
          identity: true,
          attributes: true,
          condition: true,
          purchase: true,
          value: true
        }
  })

  useEffect(() => {
    localStorage.setItem(
      'collection_visible_sections',
      JSON.stringify(visibleSections)
    )
  }, [visibleSections])

  const toggleSectionVisibility = (key: keyof VisibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const fetchCards = async () => {
    if (!userId) return

    setLoading(true)

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setCards((data as CardItem[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCards()
  }, [userId])

  /* ---------------- SAVE EDIT ---------------- */
  const saveCard = async (updated: CardItem) => {
    const { error } = await supabase
      .from('cards')
      .update(updated)
      .eq('id', updated.id)

    if (error) {
      console.error(error)
      return
    }

    setCards(prev =>
      prev.map(c => (c.id === updated.id ? updated : c))
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
      console.error(error)
      return
    }

    setCards(prev => prev.filter(c => c.id !== id))
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

      {/* HEADER (UNCHANGED) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Collection</h2>
          <p className="text-sm text-muted-foreground">
            {cards.length} cards
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(visibleSections).map(([key, value]) => (
            <button
              key={key}
              onClick={() => toggleSectionVisibility(key as keyof VisibleSections)}
              className={`px-2 py-1 rounded border ${
                value ? 'bg-primary text-black' : 'bg-muted text-gray-500'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* LIST (UNCHANGED STRUCTURE) */}
      <div className="border rounded-xl overflow-hidden bg-card">

        {cards.map(card => {
          const isOpen = selectedCard?.id === card.id

          return (
            <div key={card.id} className="border-b last:border-b-0">

              {/* ROW */}
              <button
                onClick={() => setSelectedCard(isOpen ? null : card)}
                className="w-full grid grid-cols-[80px_2fr_80px_2fr_2fr_120px_120px] gap-3 px-4 py-3 items-center hover:bg-muted/30 text-left"
              >

                <div className="w-14 h-14 rounded border bg-muted overflow-hidden">
                  {card.image_url ? (
                    <img src={card.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[10px] flex items-center justify-center h-full">
                      No Img
                    </div>
                  )}
                </div>

                <div className="font-medium text-sm truncate">
                  {card.player ?? card.full_card_name}
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
                  {card.rookie && <span className="border px-1 rounded text-[10px]">RC</span>}
                  {card.autograph && <span className="border px-1 rounded text-[10px]">AUTO</span>}
                  {card.memorabilia && <span className="border px-1 rounded text-[10px]">MEM</span>}
                </div>

                <div className="text-sm font-medium text-right">
                  ${card.estimated_value_cad ?? 0}
                </div>
              </button>

              {/* ACTIONS */}
              <div className="flex gap-2 px-4 pb-2">

                <button
                  className="text-xs px-2 py-1 border rounded"
                  onClick={() => setEditCard(card)}
                >
                  Edit
                </button>

                {deleteConfirmId === card.id ? (
                  <>
                    <button
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                      onClick={() => confirmDelete(card.id)}
                    >
                      Confirm
                    </button>

                    <button
                      className="text-xs px-2 py-1 border rounded"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="text-xs px-2 py-1 border rounded text-red-500"
                    onClick={() => setDeleteConfirmId(card.id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* EXPANDED (UNCHANGED EXACT BLOCK PRESERVED) */}
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
                          <div>Card #: {card.card_number ?? '—'}</div>
                          <div>Set: {card.set ?? '—'}</div>
                          <div>Parallel: {card.subset_parallel ?? '—'}</div>
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
                          <div>Rookie: {card.rookie ? 'Yes' : '—'}</div>
                          <div>Autograph: {card.autograph ? 'Yes' : '—'}</div>
                          <div>Memorabilia: {card.memorabilia ? 'Yes' : '—'}</div>
                          <div>Game Used: {card.game_used ? 'Yes' : '—'}</div>
                          <div>Serial: {card.serial_number ?? '—'}</div>
                        </div>
                      </div>
                    )}

                    {visibleSections.condition && (
                      <div className="border rounded p-3 bg-background">
                        <div className="text-xs font-semibold uppercase mb-2">
                          Condition
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Purchased: {card.condition_purchased ?? '—'}</div>
                          <div>Current: {card.current_condition ?? '—'}</div>
                          <div>Grading: {card.grading_company ?? '—'}</div>
                        </div>
                      </div>
                    )}

                    {visibleSections.purchase && (
                      <div className="border rounded p-3 bg-background">
                        <div className="text-xs font-semibold uppercase mb-2">
                          Purchase
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Date: {card.purchase_date ?? '—'}</div>
                          <div>From: {card.purchase_from ?? '—'}</div>
                          <div>Price: ${card.purchase_price ?? 0}</div>
                        </div>
                      </div>
                    )}

                    {visibleSections.value && (
                      <div className="border rounded p-3 bg-background md:col-span-2">
                        <div className="text-xs font-semibold uppercase mb-2">
                          Value & Sales
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div>Estimated Value: ${card.estimated_value_cad ?? 0}</div>
                          <div>Value Date: {card.value_date ?? '—'}</div>
                          <div>Sold: {card.card_sold ? 'Yes' : 'No'}</div>
                          <div>Sale Date: {card.sales_date ?? '—'}</div>
                          <div>Platform: {card.sales_platform ?? '—'}</div>
                          <div>Sale Price: ${card.sales_amount ?? 0}</div>
                          <div>Fees: ${card.fees ?? 0}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ---------------- FULL EDIT MODAL ---------------- */}
{editCard && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-background w-full max-w-3xl rounded-xl shadow-xl">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Edit Card</h3>

        <button
          className="text-sm border px-2 py-1 rounded"
          onClick={() => setEditCard(null)}
        >
          Close
        </button>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">

        {/* ================= SUMMARY ================= */}
        <div className="p-3 border rounded bg-muted/20">
          <div className="font-semibold text-sm">
            {editCard.full_card_name || 'Unnamed Card'}
          </div>
        </div>

        {/* ================= IDENTITY ================= */}
        <div className="border rounded p-3 bg-background space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Identity
          </div>

          {[
            ['year', 'Year'],
            ['brand', 'Brand'],
            ['player', 'Player'],
            ['card_number', 'Card Number'],
            ['set', 'Set'],
            ['subset_parallel', 'Parallel'],
            ['sport', 'Sport']
          ].map(([key, label]) => (
            <div key={key} className="flex justify-between gap-3 text-sm">
              <span className="w-1/3 text-muted-foreground">{label}</span>
              <input
                className="border rounded px-2 py-1 w-2/3"
                value={(editCard as any)[key] ?? ''}
                onChange={(e) =>
                  setEditCard({
                    ...editCard,
                    [key]: e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* ================= ATTRIBUTES ================= */}
        <div className="border rounded p-3 bg-background space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Attributes
          </div>

          {[
            ['rookie', 'Rookie (true/false)'],
            ['autograph', 'Autograph (true/false)'],
            ['memorabilia', 'Memorabilia (true/false)'],
            ['game_used', 'Game Used (true/false)'],
            ['serial_number', 'Serial Number']
          ].map(([key, label]) => (
            <div key={key} className="flex justify-between gap-3 text-sm">
              <span className="w-1/3 text-muted-foreground">{label}</span>

              <input
                className="border rounded px-2 py-1 w-2/3"
                value={(editCard as any)[key] ?? ''}
                onChange={(e) =>
                  setEditCard({
                    ...editCard,
                    [key]: e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* ================= CONDITION ================= */}
        <div className="border rounded p-3 bg-background space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Condition
          </div>

          {[
            ['condition_purchased', 'Purchased Condition'],
            ['current_condition', 'Current Condition'],
            ['grading_company', 'Grading Company']
          ].map(([key, label]) => (
            <div key={key} className="flex justify-between gap-3 text-sm">
              <span className="w-1/3 text-muted-foreground">{label}</span>
              <input
                className="border rounded px-2 py-1 w-2/3"
                value={(editCard as any)[key] ?? ''}
                onChange={(e) =>
                  setEditCard({
                    ...editCard,
                    [key]: e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* ================= PURCHASE ================= */}
        <div className="border rounded p-3 bg-background space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Purchase
          </div>

          {[
            ['purchase_date', 'Purchase Date'],
            ['purchase_from', 'Purchased From'],
            ['purchase_price', 'Purchase Price']
          ].map(([key, label]) => (
            <div key={key} className="flex justify-between gap-3 text-sm">
              <span className="w-1/3 text-muted-foreground">{label}</span>
              <input
                className="border rounded px-2 py-1 w-2/3"
                value={(editCard as any)[key] ?? ''}
                onChange={(e) =>
                  setEditCard({
                    ...editCard,
                    [key]: e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* ================= VALUE ================= */}
        <div className="border rounded p-3 bg-background space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Value & Sales
          </div>

          {[
            ['estimated_value_cad', 'Estimated Value'],
            ['value_date', 'Value Date'],
            ['sales_date', 'Sale Date'],
            ['sales_platform', 'Platform'],
            ['sales_amount', 'Sale Price'],
            ['fees', 'Fees']
          ].map(([key, label]) => (
            <div key={key} className="flex justify-between gap-3 text-sm">
              <span className="w-1/3 text-muted-foreground">{label}</span>
              <input
                className="border rounded px-2 py-1 w-2/3"
                value={(editCard as any)[key] ?? ''}
                onChange={(e) =>
                  setEditCard({
                    ...editCard,
                    [key]: e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t flex justify-end gap-2">
        <button
          className="px-3 py-1 border rounded"
          onClick={() => setEditCard(null)}
        >
          Cancel
        </button>

        <button
          className="px-3 py-1 bg-green-600 text-white rounded"
          onClick={() => saveCard(editCard)}
        >
          Save Changes
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  )
}