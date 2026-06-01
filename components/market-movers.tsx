'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sampleCards } from '@/lib/card-data'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MarketMover {
  name: string
  change: number
  game: string
}

export function MarketMovers() {
  // Calculate price changes for each card
  const movers: MarketMover[] = sampleCards.map((card) => {
    const history = card.priceHistory
    const oldPrice = history[0]?.price || card.marketValue
    const newPrice = history[history.length - 1]?.price || card.marketValue
    const change = ((newPrice - oldPrice) / oldPrice) * 100
    return {
      name: card.name,
      change,
      game: card.game,
    }
  })

  // Sort by absolute change
  const sortedMovers = [...movers].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
  const topMovers = sortedMovers.slice(0, 5)

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Market Movers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMovers.map((mover, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{mover.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{mover.game}</p>
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
