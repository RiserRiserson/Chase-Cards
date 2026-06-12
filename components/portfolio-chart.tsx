'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from '@/components/sections/collection/card'

type Props = {
  userId?: string
}

export function PortfolioChart({ userId }: Props) {
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

    const grouped: Record<string, number> = {}

    cards.forEach(card => {
      const date = card.purchase_date
      const value = card.estimated_value_cad ?? 0

      if (!date) return

      const monthKey = date.slice(0, 7) // YYYY-MM

      if (!grouped[monthKey]) grouped[monthKey] = 0
      grouped[monthKey] += value
    })

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({
        month: `${month.split('-')[1]}/${month.split('-')[0].slice(2)}`,
        value
      }))
  }, [cards])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">
          Portfolio Value Over Time
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-75">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.88 0.18 95)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.88 0.18 95)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />

              <XAxis
                dataKey="month"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.18 0.01 250)',
                  border: '1px solid oklch(0.28 0.01 250)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)'
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  'Value'
                ]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.88 0.18 95)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}