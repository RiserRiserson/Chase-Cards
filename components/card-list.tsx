'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { sampleCards, conditionGrades, gameLabels, type TradingCard } from '@/lib/card-data'
import { TrendingUp, TrendingDown } from 'lucide-react'

function CardRow({ card }: { card: TradingCard }) {
  const profit = card.marketValue - card.purchasePrice
  const profitPercent = ((profit / card.purchasePrice) * 100).toFixed(1)
  const isPositive = profit >= 0
  const condition = conditionGrades[card.condition]

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="w-12 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary/60">{card.game.toUpperCase()}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">{card.name}</h4>
          <Badge variant="outline" className="text-xs shrink-0">
            {card.quantity > 1 && `x${card.quantity} · `}{card.rarity}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span>{card.set}</span>
          <span>·</span>
          <span>{card.year}</span>
          <span>·</span>
          <span className={condition.color}>{condition.label}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-foreground">${(card.marketValue * card.quantity).toLocaleString()}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-destructive" />
          )}
          <span className={isPositive ? 'text-emerald-400 text-sm' : 'text-destructive text-sm'}>
            {isPositive ? '+' : ''}{profitPercent}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function CardList() {
  // Sort by market value descending
  const sortedCards = [...sampleCards].sort((a, b) => b.marketValue * b.quantity - a.marketValue * a.quantity)

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Top Cards by Value</CardTitle>
        <span className="text-sm text-muted-foreground">{sampleCards.length} cards</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedCards.map((card) => (
            <CardRow key={card.id} card={card} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
