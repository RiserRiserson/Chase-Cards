'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from '@/components/sections/collection/card'

type Props = {
  userId?: string
}

interface MarketMover {
  name: string
  change: number
  sport: string
}

export function MarketMovers({ userId }: Props) {
  const [cards, setCards] = useState<CardItem[]>([])

  useEffect(() => {
    const fetchCards = async () => {
      if (!userId) return

      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error(error)
        return
      }

      setCards((data as CardItem[]) || [])
    }

    fetchCards()
  }, [userId])

  const movers: MarketMover[] = useMemo(() => {
    if (!cards.length) return []

    return cards
      .map(card => {
        const purchase = card.purchase_price ?? 0
        const current = card.estimated_value_cad ?? 0

        // avoid divide-by-zero
        const change =
          purchase > 0 ? ((current - purchase) / purchase) * 100 : 0

        return {
          name: card.full_card_name || card.player || 'Unnamed Card',
          change,
          sport: card.sport || 'Unknown'
        }
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5)
  }, [cards])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Market Movers</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {movers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No data available
            </p>
          ) : (
            movers.map((mover, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium text-sm">{mover.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mover.sport}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {mover.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : mover.change < 0 ? (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}

                  <span
                    className={
                      mover.change > 0
                        ? 'text-emerald-400 font-medium'
                        : mover.change < 0
                        ? 'text-destructive font-medium'
                        : 'text-muted-foreground font-medium'
                    }
                  >
                    {mover.change > 0 ? '+' : ''}
                    {mover.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}