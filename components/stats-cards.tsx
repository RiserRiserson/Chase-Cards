'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Layers, BarChart3, Target } from 'lucide-react'
import { sampleCards } from '@/lib/card-data'

export function StatsCards() {
  const totalValue = sampleCards.reduce((acc, card) => acc + card.marketValue * card.quantity, 0)
  const totalCost = sampleCards.reduce((acc, card) => acc + card.purchasePrice * card.quantity, 0)
  const totalProfit = totalValue - totalCost
  const profitPercent = ((totalProfit / totalCost) * 100).toFixed(1)
  const totalCards = sampleCards.reduce((acc, card) => acc + card.quantity, 0)

  const stats = [
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Total Cards',
      value: totalCards.toString(),
      change: '+3 this month',
      trend: 'up',
      icon: Layers,
    },
    {
      title: 'Total Profit',
      value: `$${totalProfit.toLocaleString()}`,
      change: `+${profitPercent}%`,
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Avg. Card Value',
      value: `$${Math.round(totalValue / totalCards).toLocaleString()}`,
      change: '+8.2%',
      trend: 'up',
      icon: Target,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-emerald-400 text-sm' : 'text-destructive text-sm'}>
                    {stat.change}
                  </span>
                </div>
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
