'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from '@/components/sections/collection/card'

type Props = {
  userId?: string
}

export function DistributionChart({ userId }: Props) {
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

  const chartData = useMemo(() => {
    if (!cards.length) return []

    const total = cards.length

    const rookieCount = cards.filter(c => c.rookie).length
    const autographCount = cards.filter(c => c.autograph).length
    const memorabiliaCount = cards.filter(c => c.memorabilia).length
    const gameUsedCount = cards.filter(c => c.game_used).length
    const serialCount = cards.filter(c => c.serial_numbered).length

    return [
      {
        name: 'Rookie',
        value: Math.round((rookieCount / total) * 100)
      },
      {
        name: 'Autograph',
        value: Math.round((autographCount / total) * 100)
      },
      {
        name: 'Memorabilia',
        value: Math.round((memorabiliaCount / total) * 100)
      },
      {
        name: 'Game Used',
        value: Math.round((gameUsedCount / total) * 100)
      },
      {
        name: 'Serial Numbered',
        value: Math.round((serialCount / total) * 100)
      }
    ]
  }, [cards])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">
          Attribute Distribution (% of Collection)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 text-sm">

          {/* HEADER */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>Attribute</div>
            <div className="text-right">% of Collection</div>
          </div>

          {/* ROWS */}
          {chartData.map(row => (
            <div key={row.name} className="grid grid-cols-2 gap-4 items-center">

              <div className="font-medium text-sm">
                {row.name}
              </div>

              <div className="relative h-6 bg-muted rounded overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${row.value}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium">
                  {row.value}%
                </div>
              </div>

            </div>
          ))}

        </div>
      </CardContent>
    </Card>
  )
}