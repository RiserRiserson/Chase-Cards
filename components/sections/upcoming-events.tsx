'use client'

import { useEffect, useMemo, useState } from 'react'

type Category = 'NHL' | 'NFL' | 'NBA' | 'MLB' | 'Pokemon'

type ReleaseWindow = {
  category: Category
  windows: {
    label: string
    months: string[]
  }[]
}

type SetItem = {
  name: string
  category: Category
  window: string
  months: string[]
}

/** ---------------- RELEASE WINDOWS (CORE MODEL) ---------------- */
const RELEASE_WINDOWS: ReleaseWindow[] = [
  {
    category: 'NHL',
    windows: [
      { label: 'Upper Deck - Series 1', months: ['Oct', 'Nov'] },
      { label: 'Upper Deck - Series 2', months: ['Jan', 'Feb'] },
      { label: 'Mid-season updates', months: ['Feb', 'Mar', 'Apr'] },
      { label: 'Upper Deck - Extended Series', months: ['May', 'Jun'] }
    ]
  },
  {
    category: 'NFL',
    windows: [
      { label: 'Draft & rookies', months: ['Apr', 'May', 'Jun'] },
      { label: 'Prizm / flagship season start', months: ['Aug', 'Sep', 'Oct'] },
      { label: 'High-end releases', months: ['Dec', 'Jan'] }
    ]
  },
  {
    category: 'MLB',
    windows: [
      { label: 'Series 1', months: ['Feb'] },
      { label: 'Chrome / mid-season products', months: ['Mar', 'Apr', 'May'] },
      { label: 'Series 2', months: ['Jun'] },
      { label: 'Update Series', months: ['Oct', 'Nov'] }
    ]
  },
  {
    category: 'NBA',
    windows: [
      { label: 'Prizm', months: ['Dec', 'Jan', 'Feb'] },
      { label: 'Optic', months: ['Mar', 'Apr', 'May'] },
      { label: 'Select / Contenders', months: ['May', 'Jun', 'Jul'] }
    ]
  },
  {
    category: 'Pokemon',
    windows: [
      { label: 'Main expansions', months: ['Jan', 'Mar', 'May', 'Aug', 'Nov'] }
    ]
  }
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

  const [showCreateModal, setShowCreateModal] = useState(false)

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
    localStorage.setItem('upcomingEventsEventFilters', JSON.stringify(eventFilters))
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
    if (
      !newEvent.name.trim() ||
      !newEvent.date.trim() ||
      !newEvent.location.trim()
    ) return

    setEvents(prev => [...prev, newEvent])
    setNewEvent({ name: '', date: '', location: '' })
    setShowCreateModal(false)
  }

  const deleteEvent = (index: number) => {
    setEvents(prev => prev.filter((_, i) => i !== index))
  }

  /** ---------------- DERIVE RELEASE WINDOWS ---------------- */
  const derivedReleases = useMemo(() => {
    const expanded: SetItem[] = []

    RELEASE_WINDOWS.forEach(cat => {
      if (!filters[cat.category]) return

      cat.windows.forEach(w => {
        expanded.push({
          name: w.label,
          category: cat.category,
          window: w.label,
          months: w.months
        })
      })
    })

    return expanded
  }, [filters])

  const filteredEvents = useMemo(() => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date))
  }, [events])

  const categoryColor = (cat: Category) => {
    switch (cat) {
      case 'NHL':
        return 'text-blue-500'
      case 'NFL':
        return 'text-green-500'
      case 'NBA':
        return 'text-orange-500'
      case 'MLB':
        return 'text-red-500'
      case 'Pokemon':
        return 'text-purple-500'
    }
  }

  return (
    <div className="p-6 space-y-10">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        <p className="text-muted-foreground mt-1">
          Track card shows, expos, and typical release windows
        </p>
      </div>

      {!mounted ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <>
          {/* ================= EVENTS ================= */}
          <div className="space-y-3 mt-10">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Card Shows & Events</h3>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-3 py-1 rounded text-sm bg-primary text-primary-foreground"
                >
                  Add Event
                </button>

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
            </div>

            {showCreateModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-card border rounded-lg p-4 w-full max-w-md space-y-3">
                  <h3 className="font-semibold">Add Event</h3>

                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Event name"
                    value={newEvent.name}
                    onChange={e =>
                      setNewEvent(prev => ({ ...prev, name: e.target.value }))
                    }
                  />

                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Date (YYYY-MM-DD)"
                    value={newEvent.date}
                    onChange={e =>
                      setNewEvent(prev => ({ ...prev, date: e.target.value }))
                    }
                  />

                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Location"
                    value={newEvent.location}
                    onChange={e =>
                      setNewEvent(prev => ({ ...prev, location: e.target.value }))
                    }
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-3 py-1 text-sm border rounded"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={addEvent}
                      className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {eventFilters.showEvents && (
              <div className="space-y-3">
                {filteredEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No events added.
                  </p>
                )}

                {filteredEvents.map((event, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-card">
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-muted-foreground">{event.date}</div>
                    <div className="text-sm text-muted-foreground">{event.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= RELEASE WINDOWS ================= */}
          <div className="space-y-4 mt-10">

            <h3 className="text-lg font-semibold">
              Release Windows (Typical Cycle)
            </h3>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(filters) as Category[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    filters[cat]
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {derivedReleases.map((r, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 flex justify-between bg-card"
                >
                  <div>
                    <div className="font-medium">{r.name}</div>

                    <div className="text-sm text-muted-foreground">
                      {r.months.join(', ')}
                    </div>
                  </div>

                  <div className={`text-sm font-semibold ${categoryColor(r.category)}`}>
                    {r.category}
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