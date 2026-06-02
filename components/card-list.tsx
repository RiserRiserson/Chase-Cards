'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabaseClient'

export function CardList({ refreshKey }: { refreshKey: number }) {
  const [cards, setCards] = useState<any[]>([])

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')

    if (error) {
      console.error('Fetch error:', error)
      return
    }

    setCards(data || [])
  }

  useEffect(() => {
    fetchCards()
  }, [refreshKey])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Cards by Value</CardTitle>
        <span className="text-sm text-muted-foreground">
          {cards.length} cards
        </span>
      </CardHeader>

      <CardContent>
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cards yet</p>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="p-3 border-b">
              {card.name} — ${card.marketvalue}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}