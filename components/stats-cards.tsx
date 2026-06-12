'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  Target
} from 'lucide-react'

import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from '@/components/sections/collection/card'

export function StatsCards({ userId }: { userId?: string }) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)

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

  const totalValue = cards.reduce(
    (acc, card) => acc + (card.estimated_value_cad ?? 0),
    0
  )

  const totalCost = cards.reduce(
    (acc, card) => acc + (card.purchase_price ?? 0),
    0
  )

  const totalProfit = totalValue - totalCost
  const totalCards = cards.length
  const avgValue = totalCards > 0 ? totalValue / totalCards : 0

  const profitPercent =
    totalCost > 0
      ? ((totalProfit / totalCost) * 100).toFixed(1)
      : '0.0'

  const stats = [
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      change: null,
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Total Cards',
      value: totalCards.toString(),
      change: null,
      trend: 'up',
      icon: Layers
    },
    {
      title: 'Total Profit',
      value: `$${totalProfit.toLocaleString()}`,
      change: `${profitPercent}%`,
      trend: totalProfit >= 0 ? 'up' : 'down',
      icon: TrendingUp
    },
    {
      title: 'Avg. Card Value',
      value: `$${Math.round(avgValue).toLocaleString()}`,
      change: null,
      trend: 'up',
      icon: Target
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-border animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card key={stat.title} className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>

                <p className="text-2xl font-bold mt-1">
                  {stat.value}
                </p>

                {stat.change && (
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}

                    <span
                      className={
                        stat.trend === 'up'
                          ? 'text-emerald-400 text-sm'
                          : 'text-destructive text-sm'
                      }
                    >
                      {stat.change}
                    </span>
                  </div>
                )}
              </div>

              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}