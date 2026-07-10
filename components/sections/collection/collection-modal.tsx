'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { CardItem } from './card'

type CollectionModalProps = {
  editCard: CardItem
  setEditCard: Dispatch<SetStateAction<CardItem | null>>
  onSave: (card: CardItem) => void
  onClose: () => void
}

export function CollectionModal({
  editCard,
  setEditCard,
  onSave,
  onClose
}: CollectionModalProps) {
  const updateField = <K extends keyof CardItem>(
    key: K,
    value: CardItem[K]
  ) => {
    setEditCard(previous => {
      if (!previous) return previous

      return {
        ...previous,
        [key]: value
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-xl bg-background shadow-xl"
        onClick={event => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Edit Card</h3>

          <button
            type="button"
            className="rounded border px-2 py-1 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-4">
          {/* SUMMARY */}
          <div className="rounded border bg-muted/20 p-3">
            <div className="text-sm font-semibold">
              {editCard.full_card_name || 'Unnamed Card'}
            </div>
          </div>

          {/* IDENTITY */}
          <div className="space-y-2 rounded border bg-background p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Identity
            </div>

            <FieldRow
              label="Full Card Name"
              value={editCard.full_card_name ?? ''}
              onChange={value => updateField('full_card_name', value)}
            />

            <NumberFieldRow
              label="Year"
              value={editCard.year}
              onChange={value => updateField('year', value)}
              step="1"
            />

            <FieldRow
              label="Brand"
              value={editCard.brand ?? ''}
              onChange={value => updateField('brand', value)}
            />

            <FieldRow
              label="Player"
              value={editCard.player ?? ''}
              onChange={value => updateField('player', value)}
            />

            <FieldRow
              label="Card Number"
              value={editCard.card_number ?? ''}
              onChange={value => updateField('card_number', value)}
            />

            <FieldRow
              label="Set"
              value={editCard.set ?? ''}
              onChange={value => updateField('set', value)}
            />

            <FieldRow
              label="Parallel"
              value={editCard.subset_parallel ?? ''}
              onChange={value => updateField('subset_parallel', value)}
            />

            <FieldRow
              label="Sport"
              value={editCard.sport ?? ''}
              onChange={value => updateField('sport', value)}
            />
          </div>

          {/* ATTRIBUTES */}
          <div className="space-y-3 rounded border bg-background p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Attributes
            </div>

            <CheckboxRow
              label="Rookie"
              checked={Boolean(editCard.rookie)}
              onChange={value => updateField('rookie', value)}
            />

            <CheckboxRow
              label="Autograph"
              checked={Boolean(editCard.autograph)}
              onChange={value => updateField('autograph', value)}
            />

            <CheckboxRow
              label="Memorabilia"
              checked={Boolean(editCard.memorabilia)}
              onChange={value => updateField('memorabilia', value)}
            />

            <CheckboxRow
              label="Game Used"
              checked={Boolean(editCard.game_used)}
              onChange={value => updateField('game_used', value)}
            />

            <CheckboxRow
              label="Serial Numbered"
              checked={Boolean(editCard.serial_numbered)}
              onChange={value => {
                updateField('serial_numbered', value)

                if (!value) {
                  updateField('serial_number', null)
                }
              }}
            />

            <FieldRow
              label="Serial Number"
              value={editCard.serial_number ?? ''}
              onChange={value =>
                updateField('serial_number', value === '' ? null : value)
              }
              disabled={!editCard.serial_numbered}
            />
          </div>

          {/* CONDITION */}
          <div className="space-y-2 rounded border bg-background p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Condition
            </div>

            <FieldRow
              label="Purchased Condition"
              value={editCard.condition_purchased ?? ''}
              onChange={value =>
                updateField(
                  'condition_purchased',
                  value === '' ? null : value
                )
              }
            />

            <FieldRow
              label="Current Condition"
              value={editCard.current_condition ?? ''}
              onChange={value =>
                updateField('current_condition', value === '' ? null : value)
              }
            />

            <FieldRow
              label="Grading Company"
              value={editCard.grading_company ?? ''}
              onChange={value =>
                updateField('grading_company', value === '' ? null : value)
              }
            />
          </div>

          {/* PURCHASE */}
          <div className="space-y-2 rounded border bg-background p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Purchase
            </div>

            <FieldRow
              label="Purchase Date"
              type="date"
              value={editCard.purchase_date ?? ''}
              onChange={value =>
                updateField('purchase_date', value === '' ? null : value)
              }
            />

            <FieldRow
              label="Purchased From"
              value={editCard.purchase_from ?? ''}
              onChange={value =>
                updateField('purchase_from', value === '' ? null : value)
              }
            />

            <NumberFieldRow
              label="Purchase Price"
              value={editCard.purchase_price}
              onChange={value => updateField('purchase_price', value)}
            />
          </div>

          {/* VALUE AND SALES */}
          <div className="space-y-3 rounded border bg-background p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Value &amp; Sales
            </div>

            <NumberFieldRow
              label="Estimated Value"
              value={editCard.estimated_value_cad}
              onChange={value =>
                updateField('estimated_value_cad', value)
              }
            />

            <FieldRow
              label="Value Date"
              type="date"
              value={editCard.value_date ?? ''}
              onChange={value =>
                updateField('value_date', value === '' ? null : value)
              }
            />

            <CheckboxRow
              label="Card Sold"
              checked={Boolean(editCard.card_sold)}
              onChange={value => {
                updateField('card_sold', value)

                if (!value) {
                  updateField('sales_date', null)
                  updateField('sales_platform', null)
                  updateField('sales_amount', null)
                  updateField('fees', null)
                }
              }}
            />

            <FieldRow
              label="Sale Date"
              type="date"
              value={editCard.sales_date ?? ''}
              onChange={value =>
                updateField('sales_date', value === '' ? null : value)
              }
              disabled={!editCard.card_sold}
            />

            <FieldRow
              label="Sales Platform"
              value={editCard.sales_platform ?? ''}
              onChange={value =>
                updateField('sales_platform', value === '' ? null : value)
              }
              disabled={!editCard.card_sold}
            />

            <NumberFieldRow
              label="Sale Price"
              value={editCard.sales_amount}
              onChange={value => updateField('sales_amount', value)}
              disabled={!editCard.card_sold}
            />

            <NumberFieldRow
              label="Fees"
              value={editCard.fees}
              onChange={value => updateField('fees', value)}
              disabled={!editCard.card_sold}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 border-t p-3">
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded bg-green-600 px-3 py-1 text-white"
            onClick={() => onSave(editCard)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

type FieldRowProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date'
  disabled?: boolean
}

function FieldRow({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false
}: FieldRowProps) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <label className="w-1/3 text-muted-foreground">
        {label}
      </label>

      <input
        type={type}
        className="w-2/3 rounded border px-2 py-1 disabled:opacity-50"
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
      />
    </div>
  )
}

type NumberFieldRowProps = {
  label: string
  value: number | null | undefined
  onChange: (value: number | null) => void
  disabled?: boolean
  step?: string
}

function NumberFieldRow({
  label,
  value,
  onChange,
  disabled = false,
  step = '0.01'
}: NumberFieldRowProps) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <label className="w-1/3 text-muted-foreground">
        {label}
      </label>

      <input
        type="number"
        step={step}
        className="w-2/3 rounded border px-2 py-1 disabled:opacity-50"
        value={value ?? ''}
        disabled={disabled}
        onChange={event => {
          const inputValue = event.target.value

          onChange(inputValue === '' ? null : Number(inputValue))
        }}
      />
    </div>
  )
}

type CheckboxRowProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function CheckboxRow({
  label,
  checked,
  onChange
}: CheckboxRowProps) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
    </label>
  )
}