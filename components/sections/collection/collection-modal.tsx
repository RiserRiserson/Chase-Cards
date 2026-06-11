'use client'

import type { CardItem } from './card'
import { useState } from 'react'

interface Props {
  selectedCard: CardItem
  onClose: () => void
  onDelete: (id: string) => void
  onSave: (value: number) => void
  onUploadImage: (file: File) => void
}

export function CollectionModal({
  selectedCard,
  onClose,
  onDelete,
  onSave,
  onUploadImage
}: Props) {
  const [editMode, setEditMode] = useState(false)

  const [editValue, setEditValue] = useState(
    selectedCard.estimated_value_cad ?? 0
  )

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* IMAGE */}
        <div className="aspect-2.5/3.5 bg-muted overflow-hidden">
          {selectedCard.image_url ? (
            <img
              src={selectedCard.image_url}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* UPLOAD */}
        <div className="p-3 border-b">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUploadImage(file)
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-4">

          {/* HEADER */}
          <div>
            <h3 className="text-lg font-semibold">
              {selectedCard.player ?? selectedCard.full_card_name}
            </h3>

            <p className="text-xs text-muted-foreground">
              {selectedCard.year ?? '—'} • {selectedCard.brand ?? '—'} • {selectedCard.set ?? '—'}
            </p>
          </div>

          {/* ================= IDENTITY ================= */}
          <div className="border rounded p-3 space-y-1 text-sm">
            <div className="font-semibold text-xs uppercase text-muted-foreground">
              Identity
            </div>
            <div>Year: {selectedCard.year ?? '—'}</div>
            <div>Brand: {selectedCard.brand ?? '—'}</div>
            <div>Player: {selectedCard.player ?? '—'}</div>
            <div>Card #: {selectedCard.card_number ?? '—'}</div>
            <div>Set: {selectedCard.set ?? '—'}</div>
            <div>Parallel: {selectedCard.subset_parallel ?? '—'}</div>
            <div>Sport: {selectedCard.sport ?? '—'}</div>
          </div>

          {/* ================= ATTRIBUTES ================= */}
          <div className="border rounded p-3 space-y-1 text-sm">
            <div className="font-semibold text-xs uppercase text-muted-foreground">
              Attributes
            </div>
            <div>Rookie: {selectedCard.rookie ? 'Yes' : '—'}</div>
            <div>Autograph: {selectedCard.autograph ? 'Yes' : '—'}</div>
            <div>Memorabilia: {selectedCard.memorabilia ? 'Yes' : '—'}</div>
            <div>Game Used: {selectedCard.game_used ? 'Yes' : '—'}</div>
            <div>
              Serial: {selectedCard.serial_numbered ? selectedCard.serial_number : '—'}
            </div>
          </div>

          {/* ================= CONDITION ================= */}
          <div className="border rounded p-3 space-y-1 text-sm">
            <div className="font-semibold text-xs uppercase text-muted-foreground">
              Condition
            </div>
            <div>Purchased: {selectedCard.condition_purchased ?? '—'}</div>
            <div>Current: {selectedCard.current_condition ?? '—'}</div>
            <div>Grading: {selectedCard.grading_company ?? '—'}</div>
          </div>

          {/* ================= PURCHASE ================= */}
          <div className="border rounded p-3 space-y-1 text-sm">
            <div className="font-semibold text-xs uppercase text-muted-foreground">
              Purchase
            </div>
            <div>Date: {selectedCard.purchase_date ?? '—'}</div>
            <div>From: {selectedCard.purchase_from ?? '—'}</div>
            <div>Price: ${selectedCard.purchase_price ?? 0}</div>
          </div>

          {/* ================= VALUE & SALES ================= */}
          <div className="border rounded p-3 space-y-1 text-sm">
            <div className="font-semibold text-xs uppercase text-muted-foreground">
              Value & Sales
            </div>
            <div>Estimated Value: ${selectedCard.estimated_value_cad ?? 0}</div>
            <div>Value Date: {selectedCard.value_date ?? '—'}</div>
            <div>Sold: {selectedCard.card_sold ? 'Yes' : 'No'}</div>
            <div>Sale Date: {selectedCard.sales_date ?? '—'}</div>
            <div>Platform: {selectedCard.sales_platform ?? '—'}</div>
            <div>Sale Price: ${selectedCard.sales_amount ?? 0}</div>
            <div>Fees: ${selectedCard.fees ?? 0}</div>
          </div>

          {/* VALUE EDIT */}
          <div className="flex justify-between text-sm border-t pt-3">
            <span className="text-muted-foreground">Quick Value Edit</span>

            {editMode ? (
              <input
                className="border rounded px-2 py-1 w-24 text-right"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(Number(e.target.value))}
              />
            ) : (
              <span>${selectedCard.estimated_value_cad ?? 0}</span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 pt-3">

            <button
              className="flex-1 bg-blue-600 text-white py-2 rounded"
              onClick={() => {
                if (editMode) {
                  onSave(editValue)
                } else {
                  setEditMode(true)
                }
              }}
            >
              {editMode ? 'Save' : 'Edit'}
            </button>

            <button
              className="flex-1 bg-red-600 text-white py-2 rounded"
              onClick={() => onDelete(selectedCard.id)}
            >
              Delete
            </button>

          </div>

        </div>
      </div>
    </div>
  )
}