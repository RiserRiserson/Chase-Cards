'use client'

import { useState } from 'react'

type CardItem = {
  id: string
  name: string
  game: string
  set_name?: string
  set?: string
  market_value: number
  quantity: number
  image_url?: string
}

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
  const [editValue, setEditValue] = useState(selectedCard.market_value ?? 0)

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* IMAGE */}
        <div className="aspect-[2.5/3.5] bg-muted overflow-hidden">
          {selectedCard.image_url ? (
            <img
              src={selectedCard.image_url}
              alt={selectedCard.name}
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
        <div className="p-4 space-y-3">

          <div>
            <h3 className="text-lg font-semibold">{selectedCard.name}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedCard.game} • {selectedCard.set_name ?? selectedCard.set}
            </p>
          </div>

          {/* VALUE */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value</span>

            {editMode ? (
              <input
                className="border rounded px-2 py-1 w-24 text-right"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(Number(e.target.value))}
              />
            ) : (
              <span>${selectedCard.market_value ?? 0}</span>
            )}
          </div>

          {/* QTY */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span>{selectedCard.quantity ?? 0}</span>
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