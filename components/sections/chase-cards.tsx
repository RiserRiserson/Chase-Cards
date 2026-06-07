'use client'

import { useEffect, useState } from 'react'

type ChaseCard = {
  id: string
  name: string
  type: string
  image?: string
  query: string
}

const STORAGE_KEY = 'chase_cards_list'

export function ChaseCards() {
  const [cards, setCards] = useState<ChaseCard[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to load chase cards:', e)
      return []
    }
  })

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [query, setQuery] = useState('')

  // ---------------- SAVE (SAFE) ----------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
    } catch (e) {
      console.error('Failed to save chase cards:', e)
    }
  }, [cards])

  // ---------------- ADD CARD ----------------
  const addCard = () => {
    if (!name.trim()) return

    const newCard: ChaseCard = {
      id: crypto.randomUUID(),
      name,
      type,
      query,
      image: ''
    }

    setCards(prev => [...prev, newCard])
    setName('')
    setType('')
    setQuery('')
  }

  // ---------------- EBAY SEARCH ----------------
const openEbaySearch = (card: ChaseCard) => {
  const searchTerm = encodeURIComponent(card.query || card.name)

  // eBay Canada + Buy It Now + Canada location
  const ebayUrl =
    `https://www.ebay.ca/sch/i.html` +
    `?_nkw=${searchTerm}` +
    `&LH_BIN=1` +
    `&LH_PrefLoc=1` +
    `&_sop=15`

  window.open(ebayUrl, '_blank', 'noopener,noreferrer')
}

  // ---------------- DELETE ----------------
  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Chase Cards</h2>
        <p className="text-sm text-muted-foreground">
          Track cards you want and quickly search Buy It Now listings on eBay
        </p>
      </div>

      {/* ADD FORM */}
      <div className="border rounded-lg p-4 space-y-3 bg-card">

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Card name (e.g. 2018 McDavid Young Guns PSA 10)"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Card type (e.g. Hockey, Basketball)"
          value={type}
          onChange={e => setType(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Search term (eBay query)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <button
          onClick={addCard}
          className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
        >
          Add Chase Card
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {cards.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No chase cards added yet.
          </p>
        )}

        {cards.map(card => (
          <div
            key={card.id}
            className="border rounded-lg p-4 bg-card space-y-3"
          >

            {/* TOP ROW */}
            <div className="flex justify-between items-start">

              <div>
                <div className="font-medium">{card.name}</div>
                <div className="text-xs text-muted-foreground">
                  {card.type}
                </div>
              </div>

              <button
                onClick={() => removeCard(card.id)}
                className="text-xs text-red-500"
              >
                Delete
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <button
                onClick={() => openEbaySearch(card)}
                className="px-3 py-1 text-sm rounded bg-muted border"
              >
                Search eBay Buy It Now
              </button>

            </div>

          </div>
        ))}
      </div>
    </div>
  )
}