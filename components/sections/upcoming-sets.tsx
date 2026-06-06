'use client'

import { useMemo, useState } from 'react'

type Category = 'NHL' | 'NFL' | 'NBA' | 'MLB' | 'Pokemon'

type SetItem = {
  name: string
  date: string
  category: Category
}

const SETS: SetItem[] = [
  { name: 'Upper Deck Series 2', date: '2026-02-10', category: 'NHL' },
  { name: 'Topps Chrome Baseball', date: '2026-02-18', category: 'MLB' },
  { name: 'Prizm Football', date: '2026-02-25', category: 'NFL' },
  { name: 'NBA Hoops Premium', date: '2026-03-01', category: 'NBA' },
  { name: 'Pokémon Scarlet & Violet Expansion', date: '2026-03-08', category: 'Pokemon' },
  { name: 'O-Pee-CHee Hockey', date: '2026-03-15', category: 'NHL' },
  { name: 'Topps Heritage Baseball', date: '2026-03-22', category: 'MLB' },
  { name: 'Donruss Basketball', date: '2026-03-28', category: 'NBA' },
  { name: 'Pokémon Special Set Release', date: '2026-04-05', category: 'Pokemon' }
]

const DEFAULT_FILTERS: Record<Category, boolean> = {
  NHL: true,
  NFL: true,
  NBA: true,
  MLB: true,
  Pokemon: true
}

export function UpcomingSets() {

  // -----------------------------
  // Persisted filters (localStorage)
  // -----------------------------
  const [filters, setFilters] = useState<Record<Category, boolean>>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_FILTERS
    }

    try {
      const saved = localStorage.getItem('upcomingSetsFilters')
      return saved ? JSON.parse(saved) : DEFAULT_FILTERS
    } catch {
      return DEFAULT_FILTERS
    }
  })

  const toggle = (category: Category) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        [category]: !prev[category]
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'upcomingSetsFilters',
          JSON.stringify(updated)
        )
      }

      return updated
    })
  }

  const filteredSets = useMemo(() => {
    return SETS
      .filter(set => filters[set.category])
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filters])

  const categoryColor = (cat: Category) => {
    switch (cat) {
      case 'NHL': return 'text-blue-500'
      case 'NFL': return 'text-green-500'
      case 'NBA': return 'text-orange-500'
      case 'MLB': return 'text-red-500'
      case 'Pokemon': return 'text-purple-500'
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Upcoming Sets</h2>
        <p className="text-muted-foreground mt-1">
          Track upcoming sports & Pokémon card releases
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">

        {(Object.keys(filters) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`
              px-3 py-1 rounded-full text-sm border transition
              ${filters[cat]
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-transparent border-border text-muted-foreground'
              }
            `}
          >
            {cat}
          </button>
        ))}

      </div>

      {/* LIST */}
      <div className="space-y-3">

        {filteredSets.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No sets selected.
          </p>
        )}

        {filteredSets.map((set, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 flex items-center justify-between bg-card"
          >

            <div>
              <div className="font-medium">{set.name}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(set.date).toLocaleDateString()}
              </div>
            </div>

            <div className={`text-sm font-semibold ${categoryColor(set.category)}`}>
              {set.category}
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}