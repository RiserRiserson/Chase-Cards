'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from '@/components/sections/collection/card'

type Props = {
  userId?: string
}

type AttributeKey =
  | 'rookie'
  | 'autograph'
  | 'memorabilia'
  | 'game_used'
  | 'serial_numbered'

const keys: AttributeKey[] = [
  'rookie',
  'autograph',
  'memorabilia',
  'game_used',
  'serial_numbered'
]

export function AttributeHeatmap({ userId }: Props) {
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

  const heatmapData = useMemo(() => {
    if (!cards.length) return []

    const overlap = (a: AttributeKey, b: AttributeKey) =>
      cards.filter(c => Boolean(c[a]) && Boolean(c[b])).length

    return keys.map(rowKey => {
      const rowTotal = cards.filter(c => Boolean(c[rowKey])).length || 1

      const row: any = {
        name: rowKey,
        total: rowTotal
      }

      keys.forEach(colKey => {
        if (rowKey === colKey) {
          row[colKey] = 100
        } else {
          row[colKey] = Math.round(
            (overlap(rowKey, colKey) / rowTotal) * 100
          )
        }
      })

      return row
    })
  }, [cards])

  const displayLabel = (key: string) => {
    switch (key) {
      case 'rookie': return 'Rookie'
      case 'autograph': return 'Auto'
      case 'memorabilia': return 'Mem'
      case 'game_used': return 'Game Used'
      case 'serial_numbered': return 'Serial #'
      default: return key
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">
          Attribute Heatmap (Overlap %)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm">

          {/* HEADER */}
          <div className="grid grid-cols-6 gap-2 text-xs text-muted-foreground">
            <div></div>
            {keys.map(k => (
              <div key={k}>{displayLabel(k)}</div>
            ))}
          </div>

          {/* ROWS */}
          {heatmapData.map(row => (
            <div key={row.name} className="grid grid-cols-6 gap-2 items-center">

              <div className="text-xs font-medium text-muted-foreground">
                {displayLabel(row.name)}
              </div>

              {keys.map((colKey, i) => {
                const val = row[colKey]

                return (
                  <div
                    key={i}
                    className="h-8 rounded flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: `oklch(0.88 0.18 95 / ${val / 100})`,
                      color: val > 50 ? '#000' : 'var(--foreground)'
                    }}
                  >
                    {val}%
                  </div>
                )
              })}
            </div>
          ))}

        </div>
      </CardContent>
    </Card>
  )
}