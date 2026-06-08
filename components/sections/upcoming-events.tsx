'use client'

import { useEffect, useMemo, useState } from 'react'

type Category = 'NHL' | 'NFL' | 'NBA' | 'MLB' | 'Pokemon'

type SetItem = {
  name: string
  date: string
  category: Category
}

/** ---------------- UPCOMING RELEASES ---------------- */

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

/** ---------------- EVENTS (USER-DEFINED) ---------------- */

type EventItem = {
  name: string
  date: string
  location: string
}

const DEFAULT_EVENTS: EventItem[] = []

/** ---------------- FILTERS ---------------- */

const DEFAULT_FILTERS: Record<Category, boolean> = {
  NHL: true,
  NFL: true,
  NBA: true,
  MLB: true,
  Pokemon: true
}

export function UpcomingEvents() {
  const [mounted, setMounted] = useState(false)

  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS)

  const [newEvent, setNewEvent] = useState<EventItem>({
    name: '',
    date: '',
    location: ''
  })

  const [eventFilters, setEventFilters] = useState({
    showEvents: true
  })

  /** ---------------- LOAD ---------------- */

  useEffect(() => {
    try {
      const savedSets = localStorage.getItem('upcomingEventsFilters')
      if (savedSets) setFilters(JSON.parse(savedSets))

      const savedEvents = localStorage.getItem('upcomingEventsList')
      if (savedEvents) setEvents(JSON.parse(savedEvents))

      const savedEventFilters = localStorage.getItem('upcomingEventsEventFilters')
      if (savedEventFilters) setEventFilters(JSON.parse(savedEventFilters))
    } catch {}

    setMounted(true)
  }, [])

  /** ---------------- SAVE ---------------- */

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('upcomingEventsFilters', JSON.stringify(filters))
  }, [filters, mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('upcomingEventsList', JSON.stringify(events))
  }, [events, mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(
      'upcomingEventsEventFilters',
      JSON.stringify(eventFilters)
    )
  }, [eventFilters, mounted])

  /** ---------------- HELPERS ---------------- */

  const toggleCategory = (category: Category) => {
    setFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const toggleEvents = () => {
    setEventFilters(prev => ({
      showEvents: !prev.showEvents
    }))
  }

  const addEvent = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.location) return

    setEvents(prev => [...prev, newEvent])

    setNewEvent({
      name: '',
      date: '',
      location: ''
    })
  }

  const deleteEvent = (index: number) => {
    setEvents(prev => prev.filter((_, i) => i !== index))
  }

  const filteredSets = useMemo(() => {
    return SETS
      .filter(set => filters[set.category])
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filters])

  const filteredEvents = useMemo(() => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date))
  }, [events])

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
    <div className="p-6 space-y-10">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        <p className="text-muted-foreground mt-1">
          Track card shows, expos, and upcoming releases
        </p>
      </div>

      {!mounted ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <>
          {/* ================= EVENTS SECTION (FIRST) ================= */}
          <div className="space-y-3 mt-20">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Card Shows & Events</h3>

              <button
                onClick={toggleEvents}
                className={`px-3 py-1 rounded text-sm border ${
                  eventFilters.showEvents
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {eventFilters.showEvents ? 'Hide' : 'Show'}
              </button>
            </div>

            {eventFilters.showEvents && (
              <>
                {/* ADD EVENT */}
                <div className="grid gap-2 border rounded-lg p-3 bg-card">
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Event name"
                    value={newEvent.name}
                    onChange={e =>
                      setNewEvent(prev => ({ ...prev, name: e.target.value }))
                    }
                  />

                  <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Date (YYYY-MM-DD)"
                    value={newEvent.date}
                    onChange={e =>
                      setNewEvent(prev => ({ ...prev, date: e.target.value }))
                    }
                  />

                  <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Location"
                    value={newEvent.location}
                    onChange={e =>
                      setNewEvent(prev => ({
                        ...prev,
                        location: e.target.value
                      }))
                    }
                  />

                  <button
                    onClick={addEvent}
                    className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
                  >
                    Add Event
                  </button>
                </div>

                {/* LIST */}
                <div className="space-y-3">

                  {filteredEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No events added.
                    </p>
                  )}

                  {filteredEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 bg-card flex justify-between"
                    >
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.date}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.location}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteEvent(idx)}
                        className="text-xs text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ================= UPCOMING RELEASES ================= */}
          <div className="space-y-4 mt-20">

            <h3 className="text-lg font-semibold">Upcoming Releases</h3>

            <div className="flex flex-wrap gap-2">

              {(Object.keys(filters) as Category[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`
                    px-3 py-1 rounded-full text-sm border transition
                    ${
                      filters[cat]
                        ? 'bg-primary text-primary-foreground border-transparent'
                        : 'bg-transparent border-border text-muted-foreground'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">

              {filteredSets.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No sets selected.
                </p>
              )}

              {filteredSets.map((set, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 flex justify-between bg-card"
                >
                  <div>
                    <div className="font-medium">{set.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {set.date}
                    </div>
                  </div>

                  <div className={`text-sm font-semibold ${categoryColor(set.category)}`}>
                    {set.category}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      )}
    </div>
  )
}