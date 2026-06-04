'use client'

import { useEffect, useState } from 'react'
import {
  Card as CardContainer,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from '@/types/card'

export function CardList({ userId }: { userId?: string }) {
  const [cards, setCards] = useState<CardItem[]>([])

  const fetchCards = async () => {
    if (!userId) {
      setCards([])
      return
    }

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      return
    }

    setCards(data || [])
  }

  useEffect(() => {
    fetchCards()
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`cards-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cards',
          filter: `user_id=eq.${userId}`
        },
        () => fetchCards()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <CardContainer>
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
              {card.name} — ${card.market_value}
            </div>
          ))
        )}
      </CardContent>
    </CardContainer>
  )
}