'use client'

import { useState } from 'react'

type TradeEvent = {
  id: string
  date: string
  type: 'origin' | 'trade' | 'sale' | 'grading'

  fromUser?: {
    id: string
    name: string
  }

  toUser?: {
    id: string
    name: string
  }

  value?: number
  grade?: string
  notes?: string
  certId?: string
}

// SAMPLE DATA (replace later with real card lookup)
const MOCK_TREE: TradeEvent[] = [
  {
    id: '1',
    date: '2024-01-10',
    type: 'origin',
    notes: 'Pulled from hobby pack'
  },
  {
    id: '2',
    date: '2024-02-18',
    type: 'trade',
    fromUser: { id: 'u1', name: 'CollectorA' },
    toUser: { id: 'u2', name: 'CollectorB' },
    notes: '1-for-1 trade for Topps Chrome rookie'
  },
  {
    id: '3',
    date: '2024-05-02',
    type: 'grading',
    fromUser: { id: 'u2', name: 'CollectorB' },
    toUser: { id: 'psa', name: 'PSA' },
    grade: 'PSA 9',
    notes: 'Submitted for grading',
    certId: 'PSA-123456'
  },
  {
    id: '4',
    date: '2024-06-10',
    type: 'trade',
    fromUser: { id: 'u2', name: 'CollectorB' },
    toUser: { id: 'u3', name: 'CollectorC' },
    value: 250,
    notes: 'Part of 3-card bundle deal'
  },
  {
    id: '5',
    date: '2024-09-01',
    type: 'sale',
    fromUser: { id: 'u3', name: 'CollectorC' },
    toUser: { id: 'u4', name: 'BuyerD' },
    value: 420,
    notes: 'Marketplace sale'
  }
]

function getColor(type: TradeEvent['type']) {
  switch (type) {
    case 'origin':
      return 'bg-gray-500'
    case 'trade':
      return 'bg-blue-500'
    case 'sale':
      return 'bg-green-500'
    case 'grading':
      return 'bg-purple-500'
  }
}

function getLabel(event: TradeEvent) {
  switch (event.type) {
    case 'origin':
      return 'Origin'
    case 'trade':
      return 'Trade'
    case 'sale':
      return 'Sale'
    case 'grading':
      return 'Graded'
  }
}

export function TradeTree() {
  const [events] = useState<TradeEvent[]>(MOCK_TREE)

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Trade Tree</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Full lineage history of this card (origin → trades → grading → sale)
        </p>
      </div>

      {/* CARD IDENTITY HEADER (placeholder) */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="font-medium text-lg">
          2023 Topps Chrome Rookie Auto
        </div>
        <div className="text-sm text-muted-foreground">
          PSA 9 • Serial # /150
        </div>
      </div>

      {/* TIMELINE */}
<div className="space-y-8">

  {events.map((event) => (
    <div key={event.id} className="grid grid-cols-[24px_1fr] gap-4 items-start">

      {/* DOT + LINE */}
      <div className="relative flex justify-center">
        <div className={`w-3.5 h-3.5 rounded-full mt-1 ${getColor(event.type)}`} />

        {/* vertical connector line */}
        <div className="absolute top-4 bottom-8 w-px bg-border" />
      </div>

      {/* CONTENT */}
      <div className="space-y-1">

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">
            {getLabel(event)}
          </span>

          <span className="text-xs text-muted-foreground">
            {new Date(event.date).toISOString().split('T')[0]}
          </span>

          {event.grade && (
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
              {event.grade}
            </span>
          )}

          {event.value && (
            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
              ${event.value}
            </span>
          )}
        </div>

        {(event.fromUser || event.toUser) && (
          <div className="text-sm text-muted-foreground">
            {event.fromUser?.name}
            {event.fromUser && event.toUser && ' → '}
            {event.toUser?.name}
          </div>
        )}

        {event.notes && (
          <div className="text-sm text-muted-foreground">
            {event.notes}
          </div>
        )}

        {event.certId && (
          <div className="text-xs text-muted-foreground">
            Cert ID: {event.certId}
          </div>
        )}
      </div>

    </div>
  ))}
</div>

    </div>
  )
}