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
  const [cards, setCards] = useState<ChaseCard[]>([])
  const [mounted, setMounted] = useState(false)

  // ---------------- CREATE MODAL STATE ----------------
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [query, setQuery] = useState('')

  // ---------------- DRAG STATE ----------------
  const [draggedId, setDraggedId] = useState<string | null>(null)

  // ---------------- HYDRATION SAFE LOAD ----------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        setCards(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load chase cards:', e)
    }

    setMounted(true)
  }, [])

  // ---------------- SAVE (ONLY AFTER MOUNT) ----------------
  useEffect(() => {
    if (!mounted) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
    } catch (e) {
      console.error('Failed to save chase cards:', e)
    }
  }, [cards, mounted])

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

    // reset form
    setName('')
    setType('')
    setQuery('')

    // close modal
    setShowCreateModal(false)
  }

  // ---------------- DRAG + DROP ----------------
  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    setCards(prev => {
      const draggedIndex = prev.findIndex(c => c.id === draggedId)
      const targetIndex = prev.findIndex(c => c.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev
      }

      const updated = [...prev]

      const [removed] = updated.splice(draggedIndex, 1)

      updated.splice(targetIndex, 0, removed)

      return updated
    })

    setDraggedId(null)
  }

  // ---------------- EBAY SEARCH ----------------
  const openEbaySearch = (card: ChaseCard) => {
    const searchTerm = encodeURIComponent(card.query || card.name)

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

  // ---------------- RENDER ----------------
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Chase Cards</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Track cards you want and quickly search Buy It Now listings on eBay
        </p>
      </div>

      {/* LOADING STATE */}
      {!mounted ? (
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <>
          {/* CREATE BUTTON */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground"
          >
            Add Chase Card
          </button>

          {/* CREATE MODAL */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

              <div className="bg-card border rounded-lg p-4 w-full max-w-md space-y-3">

                <h3 className="font-semibold">
                  Add Chase Card
                </h3>

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

                {/* ACTIONS */}
                <div className="flex justify-end gap-2 pt-2">

                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1 text-sm border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={addCard}
                    className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
                  >
                    Save
                  </button>

                </div>

              </div>
            </div>
          )}

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
                draggable
                onDragStart={() => setDraggedId(card.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(card.id)}
              >

                {/* TOP ROW */}
                <div className="flex justify-between items-start">

                  <div>
                    <div className="font-medium">
                      {card.name}
                    </div>

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
        </>
      )}
    </div>
  )
}