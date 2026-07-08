'use client'

import { useState } from 'react'

type Sport = 'Hockey' | 'Baseball' | 'Basketball' | 'Football' | 'Pokemon' | 'Other'

export function CardIdentityPanel() {
  const [player, setPlayer] = useState('')
  const [year, setYear] = useState('')
  const [brand, setBrand] = useState('')
  const [setName, setSetName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [parallel, setParallel] = useState('')
  const [sport, setSport] = useState<Sport>('Hockey')

  return (
    <div className="mt-4 rounded-lg border p-4 bg-background space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Identify + Value</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter or detect card details, then look up estimated market value.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm space-y-1">
          <span>Player</span>
          <input
            value={player}
            onChange={e => setPlayer(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-card"
            placeholder="Connor McDavid"
          />
        </label>

        <label className="text-sm space-y-1">
          <span>Year</span>
          <input
            value={year}
            onChange={e => setYear(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-card"
            placeholder="2015"
          />
        </label>

        <label className="text-sm space-y-1">
          <span>Brand</span>
          <input
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-card"
            placeholder="Upper Deck"
          />
        </label>

        <label className="text-sm space-y-1">
          <span>Set</span>
          <input
            value={setName}
            onChange={e => setSetName(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-card"
            placeholder="Young Guns"
          />
        </label>

        <label className="text-sm space-y-1">
          <span>Card Number</span>
          <input
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-card"
            placeholder="#201"
          />
        </label>

        <label className="text-sm space-y-1">
          <span>Parallel / Insert</span>
          <input
            value={parallel}
            onChange={e => setParallel(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-card"
            placeholder="Base, Silver, Auto, etc."
          />
        </label>

        <label className="text-sm space-y-1">
          <span>Sport</span>
          <select
            value={sport}
            onChange={e => setSport(e.target.value as Sport)}
            className="w-full rounded border px-3 py-2 bg-card"
          >
            <option>Hockey</option>
            <option>Baseball</option>
            <option>Basketball</option>
            <option>Football</option>
            <option>Pokemon</option>
            <option>Other</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        className="w-full sm:w-auto px-4 py-2 rounded bg-yellow-400 text-black font-medium hover:bg-yellow-300"
      >
        Identify Card
      </button>

      <div className="rounded border p-3 text-sm space-y-2 bg-card">
        <div className="font-medium">Estimated Values</div>
        <div>Confidence: <b>--</b></div>
        <div>Estimated Raw Value: <b>--</b></div>
        <div>PSA 8: <b>--</b></div>
        <div>PSA 9: <b>--</b></div>
        <div>PSA 10: <b>--</b></div>
        <div>Last Updated: <b>--</b></div>
      </div>
    </div>
  )
}