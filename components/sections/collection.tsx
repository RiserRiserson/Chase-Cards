'use client'

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent
} from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { CardItem } from './collection/card'
import { CollectionModal } from './collection/collection-modal'
import { exportCollection } from './collection/exportCollection'
import { downloadCollectionTemplate } from './collection/downloadCollectionTemplate'
import {
  importCollectionFile,
  type ImportResult
} from './collection/importCollection'

type VisibleSections = {
  identity: boolean
  attributes: boolean
  condition: boolean
  purchase: boolean
  value: boolean
}

type CollectionSectionProps = {
  userId?: string
  readOnly?: boolean
  ownerName?: string
  searchQuery?: string
}

const defaultVisibleSections: VisibleSections = {
  identity: true,
  attributes: true,
  condition: true,
  purchase: true,
  value: true
}

export function CollectionSection({
  userId,
  readOnly = false,
  ownerName = 'Collector',
  searchQuery = ''
}: CollectionSectionProps) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] =
    useState<CardItem | null>(null)

  /* ---------------- MODAL STATE ---------------- */
  const [editCard, setEditCard] =
    useState<CardItem | null>(null)

  const [deleteConfirmId, setDeleteConfirmId] =
    useState<string | null>(null)

  /* ---------------- COLLECTION TOOLS ---------------- */
  const [toolsOpen, setToolsOpen] = useState(false)
  const [importResult, setImportResult] =
    useState<ImportResult | null>(null)

  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] =
    useState<string | null>(null)

  const importInputRef =
    useRef<HTMLInputElement | null>(null)

  const [visibleSections, setVisibleSections] =
    useState<VisibleSections>(() => {
      if (typeof window === 'undefined') {
        return defaultVisibleSections
      }

      const saved = localStorage.getItem(
        'collection_visible_sections'
      )

      if (!saved) {
        return defaultVisibleSections
      }

      try {
        return JSON.parse(saved) as VisibleSections
      } catch {
        return defaultVisibleSections
      }
    })

  useEffect(() => {
    localStorage.setItem(
      'collection_visible_sections',
      JSON.stringify(visibleSections)
    )
  }, [visibleSections])

  useEffect(() => {
    setSelectedCard(null)
    setEditCard(null)
    setDeleteConfirmId(null)
    setImportResult(null)
    setImportMessage(null)
    setToolsOpen(false)
  }, [userId, readOnly])

  const toggleSectionVisibility = (
    key: keyof VisibleSections
  ) => {
    setVisibleSections(previous => ({
      ...previous,
      [key]: !previous[key]
    }))
  }

  const fetchCards = async () => {
    if (!userId) {
      setCards([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })

    if (error) {
      console.error('Unable to load collection:', error)
      setCards([])
      setLoading(false)
      return
    }

    setCards((data as CardItem[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    void fetchCards()
  }, [userId])

const displayedCards = cards.filter(card => {
  const query = searchQuery.trim().toLowerCase()

  if (!query) return true

  const searchableValues = [
    card.full_card_name,
    card.player,
    card.brand,
    card.set,
    card.card_number,
    card.subset_parallel,
    card.sport,
    card.grading_company
  ]

  return searchableValues.some(value =>
    String(value ?? '')
      .toLowerCase()
      .includes(query)
  )
})


  /* ---------------- IMPORT FILE ---------------- */
  const handleImportFile = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (readOnly) {
      event.target.value = ''
      return
    }

    const file = event.target.files?.[0]

    if (!file) return

    setImportMessage(null)

    try {
      const result = await importCollectionFile(file)

      setImportResult(result)
    } catch (error) {
      console.error('Unable to read import file:', error)

      setImportResult({
        cards: [],
        errors: [
          'The selected spreadsheet could not be read.'
        ]
      })
    } finally {
      event.target.value = ''
    }
  }

  /* ---------------- CONFIRM IMPORT ---------------- */
  const confirmImport = async () => {
    if (readOnly) return

    if (!userId) {
      setImportMessage(
        'You must be signed in before importing cards.'
      )
      return
    }

    if (
      !importResult ||
      importResult.cards.length === 0
    ) {
      setImportMessage(
        'There are no valid cards to import.'
      )
      return
    }

    if (importResult.errors.length > 0) {
      setImportMessage(
        'Resolve the spreadsheet errors before importing.'
      )
      return
    }

    setImporting(true)
    setImportMessage(null)

    const rowsToInsert = importResult.cards.map(card => ({
      ...card,
      user_id: userId
    }))

    const { error } = await supabase
      .from('cards')
      .insert(rowsToInsert)

    if (error) {
      console.error(
        'Unable to import collection:',
        error
      )

      setImportMessage(
        'The collection could not be imported.'
      )

      setImporting(false)
      return
    }

    await fetchCards()

    setImportResult(null)

    setImportMessage(
      `${rowsToInsert.length} cards imported successfully.`
    )

    setImporting(false)
  }

  /* ---------------- SAVE EDIT ---------------- */
  const saveCard = async (updated: CardItem) => {
    if (readOnly) return

    const { error } = await supabase
      .from('cards')
      .update(updated)
      .eq('id', updated.id)
      .eq('user_id', userId)

    if (error) {
      console.error('Unable to save card:', error)
      return
    }

    setCards(previous =>
      previous.map(card =>
        card.id === updated.id ? updated : card
      )
    )

    setSelectedCard(previous =>
      previous?.id === updated.id
        ? updated
        : previous
    )

    setEditCard(null)
  }

  /* ---------------- DELETE ---------------- */
  const confirmDelete = async (id: string) => {
    if (readOnly) return

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Unable to delete card:', error)
      return
    }

    setCards(previous =>
      previous.filter(card => card.id !== id)
    )

    setSelectedCard(previous =>
      previous?.id === id ? null : previous
    )

    setEditCard(previous =>
      previous?.id === id ? null : previous
    )

    setDeleteConfirmId(null)
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading collection...
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold">
              Collection
            </h2>

            {readOnly && (
              <span className="rounded border px-2 py-1 text-xs text-muted-foreground">
                Read only
              </span>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
  <div>
    {readOnly
      ? `${ownerName}'s collection · `
      : ''}
    {cards.length} {cards.length === 1 ? 'card' : 'cards'}
  </div>

  {searchQuery.trim() && (
    <div className="text-xs">
      Showing {displayedCards.length} matching{' '}
      {displayedCards.length === 1 ? 'card' : 'cards'}
    </div>
  )}
</div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* COLLECTION TOOLS DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setToolsOpen(previous => !previous)
              }
              className="rounded bg-primary px-3 py-2 text-sm text-black"
            >
              Collection Tools

              <span className="ml-2 text-xs">
                {toolsOpen ? '▲' : '▼'}
              </span>
            </button>

            {toolsOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded border bg-background shadow-lg">
                <button
                  type="button"
                  disabled={cards.length === 0}
                  onClick={() => {
                    exportCollection(cards)
                    setToolsOpen(false)
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export Collection
                </button>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setImportResult(null)
                      setImportMessage(null)
                      importInputRef.current?.click()
                      setToolsOpen(false)
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    Import Collection
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    downloadCollectionTemplate()
                    setToolsOpen(false)
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  Download Template
                </button>
              </div>
            )}
          </div>

          {/* SECTION VISIBILITY BUTTONS */}
          <div className="flex flex-wrap justify-end gap-2 text-xs">
            {Object.entries(visibleSections).map(
              ([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    toggleSectionVisibility(
                      key as keyof VisibleSections
                    )
                  }
                  className={`rounded border px-2 py-1 ${
                    value
                      ? 'bg-primary text-black'
                      : 'bg-muted text-gray-500'
                  }`}
                >
                  {key}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {!readOnly && importMessage && (
        <div className="rounded-xl border bg-background p-4 text-sm">
          {importMessage}
        </div>
      )}

      {!readOnly && importResult && (
        <div className="space-y-3 rounded-xl border bg-background p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">
                Import Preview
              </h3>

              <p className="text-sm text-muted-foreground">
                {importResult.cards.length} cards found
              </p>
            </div>

            <button
              type="button"
              className="rounded border px-3 py-1 text-sm"
              onClick={() => {
                setImportResult(null)
                setImportMessage(null)
              }}
              disabled={importing}
            >
              Close
            </button>
          </div>

          {importResult.errors.length > 0 ? (
            <div className="rounded border border-red-500/40 bg-red-500/10 p-3">
              <div className="mb-2 text-sm font-semibold text-red-500">
                {importResult.errors.length} import errors
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
                {importResult.errors.map(
                  (error, index) => (
                    <div key={`${error}-${index}`}>
                      {error}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="rounded border border-green-500/40 bg-green-500/10 p-3 text-sm">
              The spreadsheet passed validation.
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded border px-3 py-2 text-sm"
              onClick={() => {
                setImportResult(null)
                setImportMessage(null)
              }}
              disabled={importing}
            >
              Cancel
            </button>

            <button
              type="button"
              className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={confirmImport}
              disabled={
                importing ||
                importResult.cards.length === 0 ||
                importResult.errors.length > 0
              }
            >
              {importing
                ? 'Importing...'
                : `Confirm Import (${importResult.cards.length})`}
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {displayedCards.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            {cards.length === 0
  ? 'No cards have been added yet.'
  : 'No cards match your search.'}
          </div>
        ) : (
          displayedCards.map(card => {
            const isOpen =
              selectedCard?.id === card.id

            return (
              <div
                key={card.id}
                className="border-b last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCard(
                      isOpen ? null : card
                    )
                  }
                  className="grid w-full grid-cols-[80px_2fr_80px_2fr_2fr_120px_120px] items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
                >
                  <div className="h-14 w-14 overflow-hidden rounded border bg-muted">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={
                          card.full_card_name ??
                          card.player ??
                          'Trading card'
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px]">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="truncate text-sm font-medium">
                    {card.player ??
                      card.full_card_name ??
                      'Unnamed Card'}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {card.year ?? '—'}
                  </div>

                  <div className="truncate text-sm">
                    {card.set ?? '—'}
                  </div>

                  <div className="truncate text-sm">
                    {card.brand ?? '—'}
                  </div>

                  <div className="flex gap-2 text-xs">
                    {card.rookie && (
                      <span className="rounded border px-1 text-[10px]">
                        RC
                      </span>
                    )}

                    {card.autograph && (
                      <span className="rounded border px-1 text-[10px]">
                        AUTO
                      </span>
                    )}

                    {card.memorabilia && (
                      <span className="rounded border px-1 text-[10px]">
                        MEM
                      </span>
                    )}
                  </div>

                  <div className="text-right text-sm font-medium">
                    ${card.estimated_value_cad ?? 0}
                  </div>
                </button>

                {!readOnly && (
                  <div className="flex gap-2 px-4 pb-2">
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-xs"
                      onClick={() => setEditCard(card)}
                    >
                      Edit
                    </button>

                    {deleteConfirmId === card.id ? (
                      <>
                        <button
                          type="button"
                          className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                          onClick={() =>
                            confirmDelete(card.id)
                          }
                        >
                          Confirm
                        </button>

                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() =>
                            setDeleteConfirmId(null)
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-xs text-red-500"
                        onClick={() =>
                          setDeleteConfirmId(card.id)
                        }
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}

                {isOpen && (
                  <div className="space-y-6 bg-muted/20 p-5">
                    <div className="rounded border bg-background p-3">
                      <div className="text-sm font-semibold">
                        {card.full_card_name ??
                          'Unnamed Card'}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {visibleSections.identity && (
                        <div className="rounded border bg-background p-3">
                          <div className="mb-2 text-xs font-semibold uppercase">
                            Identity
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              Year: {card.year ?? '—'}
                            </div>
                            <div>
                              Brand: {card.brand ?? '—'}
                            </div>
                            <div>
                              Player: {card.player ?? '—'}
                            </div>
                            <div>
                              Card #: {card.card_number ?? '—'}
                            </div>
                            <div>
                              Set: {card.set ?? '—'}
                            </div>
                            <div>
                              Parallel:{' '}
                              {card.subset_parallel ?? '—'}
                            </div>
                            <div>
                              Sport: {card.sport ?? '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {visibleSections.attributes && (
                        <div className="rounded border bg-background p-3">
                          <div className="mb-2 text-xs font-semibold uppercase">
                            Attributes
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              Rookie:{' '}
                              {card.rookie ? 'Yes' : '—'}
                            </div>

                            <div>
                              Autograph:{' '}
                              {card.autograph ? 'Yes' : '—'}
                            </div>

                            <div>
                              Memorabilia:{' '}
                              {card.memorabilia
                                ? 'Yes'
                                : '—'}
                            </div>

                            <div>
                              Game Used:{' '}
                              {card.game_used
                                ? 'Yes'
                                : '—'}
                            </div>

                            <div>
                              Serial:{' '}
                              {card.serial_numbered
                                ? card.serial_number ??
                                  'Yes'
                                : '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {visibleSections.condition && (
                        <div className="rounded border bg-background p-3">
                          <div className="mb-2 text-xs font-semibold uppercase">
                            Condition
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              Purchased:{' '}
                              {card.condition_purchased ??
                                '—'}
                            </div>

                            <div>
                              Current:{' '}
                              {card.current_condition ??
                                '—'}
                            </div>

                            <div>
                              Grading:{' '}
                              {card.grading_company ??
                                '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {visibleSections.purchase && (
                        <div className="rounded border bg-background p-3">
                          <div className="mb-2 text-xs font-semibold uppercase">
                            Purchase
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              Date:{' '}
                              {card.purchase_date ?? '—'}
                            </div>

                            <div>
                              From:{' '}
                              {card.purchase_from ?? '—'}
                            </div>

                            <div>
                              Price: $
                              {card.purchase_price ?? 0}
                            </div>
                          </div>
                        </div>
                      )}

                      {visibleSections.value && (
                        <div className="rounded border bg-background p-3 md:col-span-2">
                          <div className="mb-2 text-xs font-semibold uppercase">
                            Value &amp; Sales
                          </div>

                          <div className="grid gap-2 text-sm md:grid-cols-2">
                            <div>
                              Estimated Value: $
                              {card.estimated_value_cad ??
                                0}
                            </div>

                            <div>
                              Value Date:{' '}
                              {card.value_date ?? '—'}
                            </div>

                            <div>
                              Sold:{' '}
                              {card.card_sold
                                ? 'Yes'
                                : 'No'}
                            </div>

                            <div>
                              Sale Date:{' '}
                              {card.sales_date ?? '—'}
                            </div>

                            <div>
                              Platform:{' '}
                              {card.sales_platform ??
                                '—'}
                            </div>

                            <div>
                              Sale Price: $
                              {card.sales_amount ?? 0}
                            </div>

                            <div>
                              Fees: ${card.fees ?? 0}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {!readOnly && (
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleImportFile}
        />
      )}

      {!readOnly && editCard && (
        <CollectionModal
          editCard={editCard}
          setEditCard={setEditCard}
          onSave={saveCard}
          onClose={() => setEditCard(null)}
        />
      )}
    </div>
  )
}