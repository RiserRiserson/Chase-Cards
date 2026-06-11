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

        {/* SECTION TOGGLES */}
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

      {/* LIST */}
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

                {/* IMAGE */}
                <div className="w-14 h-14 rounded border bg-muted overflow-hidden">
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[10px] flex items-center justify-center h-full">
                      No Img
                    </div>
                  )}
                </div>

                {/* PLAYER */}
                <div className="font-medium text-sm truncate">
                  {card.player ?? card.full_card_name}
                </div>

                {/* YEAR */}
                <div className="text-sm text-muted-foreground">
                  {card.year ?? '—'}
                </div>

                {/* SET */}
                <div className="text-sm truncate">
                  {card.set ?? '—'}
                </div>

                {/* BRAND */}
                <div className="text-sm truncate">
                  {card.brand ?? '—'}
                </div>

                {/* ICONS */}
                <div className="flex gap-2 text-xs">
                  {card.rookie && <span className="border px-1 rounded text-[10px]">RC</span>}
                  {card.autograph && <span className="border px-1 rounded text-[10px]">AUTO</span>}
                  {card.memorabilia && <span className="border px-1 rounded text-[10px]">MEM</span>}
                </div>

                {/* VALUE */}
                <div className="text-sm font-medium text-right">
                  ${card.estimated_value_cad ?? 0}
                </div>

              </button>

              {/* EXPANDED */}
              {isOpen && (
                <div className="p-5 bg-muted/20 space-y-6">

                  {/* SUMMARY */}
                  <div className="p-3 border rounded bg-background">
                    <div className="font-semibold text-sm">
                      {card.full_card_name ?? 'Unnamed Card'}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {card.year} {card.brand} • {card.player}
                    </div>

                    <div className="flex gap-2 mt-2 text-xs">
                      {card.rookie && <span>RC</span>}
                      {card.autograph && <span>AUTO</span>}
                      {card.memorabilia && <span>MEM</span>}
                      {card.serial_numbered && (
                        <span>SN {card.serial_number}</span>
                      )}
                    </div>
                  </div>

                  {/* GRID */}
                  <div className="grid md:grid-cols-2 gap-4">

                    {visibleSections.identity && (
                      <div className="border rounded p-3 bg-background">
                        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
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
                        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                          Attributes
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Rookie: {card.rookie ? 'Yes' : '—'}</div>
                          <div>Autograph: {card.autograph ? 'Yes' : '—'}</div>
                          <div>Memorabilia: {card.memorabilia ? 'Yes' : '—'}</div>
                          <div>Game Used: {card.game_used ? 'Yes' : '—'}</div>
                          <div>
                            Serial: {card.serial_numbered ? card.serial_number : '—'}
                          </div>
                        </div>
                      </div>
                    )}

                    {visibleSections.condition && (
                      <div className="border rounded p-3 bg-background">
                        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
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
                        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
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
                        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
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
    </div>
  )
}