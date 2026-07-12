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

type SortOption =
  | 'newest'
  | 'oldest'
  | 'player-asc'
  | 'player-desc'
  | 'year-desc'
  | 'year-asc'
  | 'value-desc'
  | 'value-asc'
  | 'purchase-desc'
  | 'purchase-asc'

type CollectionView = 'list' | 'grid'

type BooleanFilter = 'all' | 'yes' | 'no'

type CollectionFilters = {
  sport: string
  rookie: BooleanFilter
  autograph: BooleanFilter
  memorabilia: BooleanFilter
  serialNumbered: BooleanFilter
  graded: BooleanFilter
  sold: BooleanFilter
}

type OpenMenu =
  | 'sort'
  | 'filter'
  | 'view'
  | 'tools'
  | null

const defaultVisibleSections: VisibleSections = {
  identity: true,
  attributes: true,
  condition: true,
  purchase: true,
  value: true
}

const defaultCollectionFilters: CollectionFilters = {
  sport: 'all',
  rookie: 'all',
  autograph: 'all',
  memorabilia: 'all',
  serialNumbered: 'all',
  graded: 'all',
  sold: 'all'
}

const sectionLabels: Record<keyof VisibleSections, string> = {
  identity: 'Identity',
  attributes: 'Attributes',
  condition: 'Condition',
  purchase: 'Purchase',
  value: 'Value'
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

  /* ---------------- CONTROL MENUS ---------------- */
const [openMenu, setOpenMenu] =
  useState<OpenMenu>(null)

const [sortOption, setSortOption] =
  useState<SortOption>('newest')

const [filters, setFilters] =
  useState<CollectionFilters>(defaultCollectionFilters)

const [collectionView, setCollectionView] =
  useState<CollectionView>(() => {
    if (typeof window === 'undefined') {
      return 'list'
    }

    const savedView = localStorage.getItem(
      'collection_view'
    )

    return savedView === 'grid' ? 'grid' : 'list'
  })

/* ---------------- COLLECTION TOOLS ---------------- */
const [importResult, setImportResult] =
  useState<ImportResult | null>(null)

  const [importing, setImporting] = useState(false)

  const [importMessage, setImportMessage] =
    useState<string | null>(null)

  const importInputRef =
    useRef<HTMLInputElement | null>(null)

  /* ---------------- VISIBLE SECTIONS ---------------- */
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
  localStorage.setItem(
    'collection_view',
    collectionView
  )
}, [collectionView])

useEffect(() => {
  setSelectedCard(null)
    setEditCard(null)
    setDeleteConfirmId(null)
    setImportResult(null)
    setImportMessage(null)
    setOpenMenu(null)
  }, [userId, readOnly])

  const toggleMenu = (menu: Exclude<OpenMenu, null>) => {
    setOpenMenu(previous =>
      previous === menu ? null : menu
    )
  }

  const closeMenus = () => {
    setOpenMenu(null)
  }

  const toggleSectionVisibility = (
    key: keyof VisibleSections
  ) => {
    setVisibleSections(previous => ({
      ...previous,
      [key]: !previous[key]
    }))
  }

  const showAllSections = () => {
    setVisibleSections(defaultVisibleSections)
  }

  const hideAllSections = () => {
    setVisibleSections({
      identity: false,
      attributes: false,
      condition: false,
      purchase: false,
      value: false
    })
  }

  /* ---------------- LOAD CARDS ---------------- */
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

  /* ---------------- SEARCHED, FILTERED, SORTED CARDS ---------------- */
const displayedCards = cards
  .filter(card => {
    const query = searchQuery.trim().toLowerCase()

    const matchesSearch = !query
      ? true
      : [
          card.full_card_name,
          card.player,
          card.brand,
          card.set,
          card.card_number,
          card.subset_parallel,
          card.sport,
          card.grading_company
        ].some(value =>
          String(value ?? '')
            .toLowerCase()
            .includes(query)
        )

    const matchesBooleanFilter = (
      value: boolean | null | undefined,
      filter: BooleanFilter
    ) => {
      if (filter === 'all') return true
      if (filter === 'yes') return Boolean(value)

      return !value
    }

    const matchesSport =
      filters.sport === 'all' ||
      String(card.sport ?? '').toLowerCase() ===
        filters.sport.toLowerCase()

    const matchesRookie = matchesBooleanFilter(
      card.rookie,
      filters.rookie
    )

    const matchesAutograph = matchesBooleanFilter(
      card.autograph,
      filters.autograph
    )

    const matchesMemorabilia = matchesBooleanFilter(
      card.memorabilia,
      filters.memorabilia
    )

    const matchesSerialNumbered = matchesBooleanFilter(
      card.serial_numbered,
      filters.serialNumbered
    )

    const matchesGraded =
      filters.graded === 'all'
        ? true
        : filters.graded === 'yes'
          ? Boolean(card.grading_company?.trim())
          : !card.grading_company?.trim()

    const matchesSold = matchesBooleanFilter(
      card.card_sold,
      filters.sold
    )

    return (
      matchesSearch &&
      matchesSport &&
      matchesRookie &&
      matchesAutograph &&
      matchesMemorabilia &&
      matchesSerialNumbered &&
      matchesGraded &&
      matchesSold
    )
  })
  .sort((cardA, cardB) => {
    switch (sortOption) {
      case 'oldest':
        return String(cardA.id).localeCompare(
          String(cardB.id)
        )

      case 'player-asc':
        return String(
          cardA.player ?? cardA.full_card_name ?? ''
        ).localeCompare(
          String(
            cardB.player ??
              cardB.full_card_name ??
              ''
          )
        )

      case 'player-desc':
        return String(
          cardB.player ?? cardB.full_card_name ?? ''
        ).localeCompare(
          String(
            cardA.player ??
              cardA.full_card_name ??
              ''
          )
        )

      case 'year-desc':
        return (
          Number(cardB.year ?? 0) -
          Number(cardA.year ?? 0)
        )

      case 'year-asc':
        return (
          Number(cardA.year ?? 0) -
          Number(cardB.year ?? 0)
        )

      case 'value-desc':
        return (
          Number(cardB.estimated_value_cad ?? 0) -
          Number(cardA.estimated_value_cad ?? 0)
        )

      case 'value-asc':
        return (
          Number(cardA.estimated_value_cad ?? 0) -
          Number(cardB.estimated_value_cad ?? 0)
        )

      case 'purchase-desc':
        return (
          Number(cardB.purchase_price ?? 0) -
          Number(cardA.purchase_price ?? 0)
        )

      case 'purchase-asc':
        return (
          Number(cardA.purchase_price ?? 0) -
          Number(cardB.purchase_price ?? 0)
        )

            case 'newest':
      default:
        return String(cardB.id).localeCompare(
          String(cardA.id)
        )
    }
  })

/* ---------------- FILTER HELPERS ---------------- */
const availableSports = Array.from(
  new Set(
    cards
      .map(card => card.sport?.trim())
      .filter((sport): sport is string => Boolean(sport))
  )
).sort((sportA, sportB) =>
  sportA.localeCompare(sportB)
)

const updateFilter = <Key extends keyof CollectionFilters>(
  key: Key,
  value: CollectionFilters[Key]
) => {
  setFilters(previous => ({
    ...previous,
    [key]: value
  }))
}

const clearFilters = () => {
  setFilters(defaultCollectionFilters)
}

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
      console.error(
        'Unable to read import file:',
        error
      )

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
    <div
      className="space-y-6 p-6"
      onClick={event => {
        if (event.currentTarget === event.target) {
          closeMenus()
        }
      }}
    >
      {/* HEADER */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
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

                {cards.length}{' '}
                {cards.length === 1 ? 'card' : 'cards'}
              </div>

              {searchQuery.trim() && (
                <div className="text-xs">
                  Showing {displayedCards.length} matching{' '}
                  {displayedCards.length === 1
                    ? 'card'
                    : 'cards'}
                </div>
              )}
            </div>
          </div>

          {/* COLLECTION CONTROL TOOLBAR */}
          <div className="flex flex-wrap justify-end gap-2">
            {/* SORT */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('sort')}
                className={`rounded border px-3 py-2 text-sm ${
                  openMenu === 'sort'
                    ? 'bg-primary text-black'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                Sort

                <span className="ml-2 text-xs">
                  {openMenu === 'sort' ? '▲' : '▼'}
                </span>
              </button>

              {openMenu === 'sort' && (
                <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded border bg-background shadow-lg">
                  <div className="border-b px-3 py-2">
                    <div className="text-sm font-semibold">
                      Sort Collection
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Choose a category to sort
                    </div>
                  </div>

                  <div className="space-y-1 p-2">
  {[
    ['newest', 'Newest Added'],
    ['oldest', 'Oldest Added'],
    ['player-asc', 'Player A–Z'],
    ['player-desc', 'Player Z–A'],
    ['year-desc', 'Year — Newest First'],
    ['year-asc', 'Year — Oldest First'],
    ['value-desc', 'Estimated Value — High to Low'],
    ['value-asc', 'Estimated Value — Low to High'],
    ['purchase-desc', 'Purchase Price — High to Low'],
    ['purchase-asc', 'Purchase Price — Low to High']
  ].map(([value, label]) => (
    <button
      key={value}
      type="button"
      onClick={() => {
        setSortOption(value as SortOption)
        closeMenus()
      }}
      className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted ${
        sortOption === value
          ? 'bg-muted font-medium'
          : ''
      }`}
    >
      {label}
    </button>
  ))}
</div>
                </div>
              )}
            </div>

            {/* FILTER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('filter')}
                className={`rounded border px-3 py-2 text-sm ${
                  openMenu === 'filter'
                    ? 'bg-primary text-black'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                Filter

                <span className="ml-2 text-xs">
                  {openMenu === 'filter'
                    ? '▲'
                    : '▼'}
                </span>
              </button>

              {openMenu === 'filter' && (
  <div className="absolute right-0 z-30 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded border bg-background shadow-lg">
    <div className="border-b px-3 py-2">
      <div className="text-sm font-semibold">
        Filter Collection
      </div>

      <div className="text-xs text-muted-foreground">
        Show only cards matching the selected criteria
      </div>
    </div>

    <div className="space-y-4 p-3">
      {/* SPORT */}
      <div className="space-y-1">
        <label
          htmlFor="collection-filter-sport"
          className="text-xs font-semibold uppercase text-muted-foreground"
        >
          Sport
        </label>

        <select
          id="collection-filter-sport"
          value={filters.sport}
          onChange={event =>
            updateFilter('sport', event.target.value)
          }
          className="w-full rounded border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Sports</option>

          {availableSports.map(sport => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {/* CARD ATTRIBUTES */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          Card Attributes
        </div>

        {[
          ['rookie', 'Rookie'],
          ['autograph', 'Autograph'],
          ['memorabilia', 'Memorabilia'],
          ['serialNumbered', 'Serial Numbered']
        ].map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-sm">{label}</span>

            <select
              value={
                filters[
                  key as keyof Pick<
                    CollectionFilters,
                    | 'rookie'
                    | 'autograph'
                    | 'memorabilia'
                    | 'serialNumbered'
                  >
                ]
              }
              onChange={event =>
                updateFilter(
                  key as
                    | 'rookie'
                    | 'autograph'
                    | 'memorabilia'
                    | 'serialNumbered',
                  event.target.value as BooleanFilter
                )
              }
              className="w-28 rounded border bg-background px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        ))}
      </div>

      {/* STATUS */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          Status
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">Graded</span>

          <select
            value={filters.graded}
            onChange={event =>
              updateFilter(
                'graded',
                event.target.value as BooleanFilter
              )
            }
            className="w-28 rounded border bg-background px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">Sold</span>

          <select
            value={filters.sold}
            onChange={event =>
              updateFilter(
                'sold',
                event.target.value as BooleanFilter
              )
            }
            className="w-28 rounded border bg-background px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="yes">Sold</option>
            <option value="no">Unsold</option>
          </select>
        </div>
      </div>
    </div>

    <div className="flex justify-end gap-2 border-t p-3">
      <button
        type="button"
        onClick={clearFilters}
        className="rounded border px-3 py-1.5 text-xs hover:bg-muted"
      >
        Clear Filters
      </button>

      <button
        type="button"
        onClick={closeMenus}
        className="rounded bg-primary px-3 py-1.5 text-xs text-black"
      >
        Done
      </button>
    </div>
  </div>
)}
            </div>

            {/* VIEW */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('view')}
                className={`rounded border px-3 py-2 text-sm ${
                  openMenu === 'view'
                    ? 'bg-primary text-black'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                View

                <span className="ml-2 text-xs">
                  {openMenu === 'view' ? '▲' : '▼'}
                </span>
              </button>

              {openMenu === 'view' && (
  <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded border bg-background shadow-lg">
    <div className="border-b px-3 py-2">
      <div className="text-sm font-semibold">
        Collection View
      </div>

      <div className="text-xs text-muted-foreground">
        Choose how cards and expanded details are displayed
      </div>
    </div>

    {/* LAYOUT */}
    <div className="space-y-1 border-b p-2">
      <div className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
        Layout
      </div>

      <button
        type="button"
        onClick={() => {
          setCollectionView('list')
          setSelectedCard(null)
          closeMenus()
        }}
        className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted ${
          collectionView === 'list'
            ? 'bg-muted font-medium'
            : ''
        }`}
      >
        List View
      </button>

      <button
        type="button"
        onClick={() => {
          setCollectionView('grid')
          setSelectedCard(null)
          closeMenus()
        }}
        className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted ${
          collectionView === 'grid'
            ? 'bg-muted font-medium'
            : ''
        }`}
      >
        Grid View
      </button>
    </div>

    {/* VISIBLE DETAILS */}
    <div className="space-y-1 p-2">
      <div className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
        Visible Details
      </div>

      {(
        Object.keys(
          visibleSections
        ) as Array<
          keyof VisibleSections
        >
      ).map(key => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded px-3 py-2 text-sm hover:bg-muted"
                      >
                        <span>
                          {sectionLabels[key]}
                        </span>

                        <input
                          type="checkbox"
                          checked={visibleSections[key]}
                          onChange={() =>
                            toggleSectionVisibility(key)
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2 border-t p-2">
                    <button
                      type="button"
                      onClick={showAllSections}
                      className="flex-1 rounded border px-2 py-1.5 text-xs hover:bg-muted"
                    >
                      Show All
                    </button>

                    <button
                      type="button"
                      onClick={hideAllSections}
                      className="flex-1 rounded border px-2 py-1.5 text-xs hover:bg-muted"
                    >
                      Hide All
                    </button>
    </div>
  </div>
)}
            </div>

            {/* COLLECTION TOOLS */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('tools')}
                className={`rounded border px-3 py-2 text-sm ${
                  openMenu === 'tools'
                    ? 'bg-primary text-black'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                Collection Tools

                <span className="ml-2 text-xs">
                  {openMenu === 'tools'
                    ? '▲'
                    : '▼'}
                </span>
              </button>

              {openMenu === 'tools' && (
                <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded border bg-background shadow-lg">
                  <button
                    type="button"
                    disabled={cards.length === 0}
                    onClick={() => {
                      exportCollection(cards)
                      closeMenus()
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
                        closeMenus()
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
                      closeMenus()
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    Download Template
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IMPORT MESSAGE */}
      {!readOnly && importMessage && (
        <div className="rounded-xl border bg-background p-4 text-sm">
          {importMessage}
        </div>
      )}

      {/* IMPORT PREVIEW */}
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

      {/* COLLECTION RESULTS */}
{displayedCards.length === 0 ? (
  <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
    {cards.length === 0
      ? 'No cards have been added yet.'
      : 'No cards match your search or filters.'}
  </div>
) : collectionView === 'grid' ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {displayedCards.map(card => {
      const isOpen = selectedCard?.id === card.id

      return (
        <div
          key={card.id}
          className={`overflow-hidden rounded-xl border bg-card ${
            isOpen ? 'ring-2 ring-primary' : ''
          }`}
        >
          <button
            type="button"
            onClick={() =>
              setSelectedCard(isOpen ? null : card)
            }
            className="block w-full text-left hover:bg-muted/30"
          >
            <div className="aspect-3/4 w-full overflow-hidden bg-muted">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={
                    card.full_card_name ??
                    card.player ??
                    'Trading card'
                  }
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            <div className="space-y-2 p-4">
              <div className="wrap-break-word font-medium">
                {card.player ??
                  card.full_card_name ??
                  'Unnamed Card'}
              </div>

              <div className="text-sm text-muted-foreground">
                {card.year ?? '—'} · {card.brand ?? '—'}
              </div>

              <div className="wrap-break-word text-sm">
                {card.set ?? '—'}
              </div>

              <div className="flex min-h-5 flex-wrap gap-1">
                {card.rookie && (
                  <span className="rounded border px-1.5 py-0.5 text-[10px]">
                    RC
                  </span>
                )}

                {card.autograph && (
                  <span className="rounded border px-1.5 py-0.5 text-[10px]">
                    AUTO
                  </span>
                )}

                {card.memorabilia && (
                  <span className="rounded border px-1.5 py-0.5 text-[10px]">
                    MEM
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold">
                ${card.estimated_value_cad ?? 0}
              </div>
            </div>
          </button>

          {!readOnly && (
            <div className="flex gap-2 border-t px-4 py-3">
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
                    onClick={() => confirmDelete(card.id)}
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
        </div>
      )
    })}
  </div>
) : (
  <div className="overflow-hidden rounded-xl border bg-card">
    {displayedCards.map(card => {
            const isOpen =
              selectedCard?.id === card.id

            return (
              <div
                key={card.id}
                className="border-b last:border-b-0"
              >
                {/* PRIMARY ROW */}
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

                {/* EDIT / DELETE ACTIONS */}
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

                {/* EXPANDED DETAILS */}
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
                  })}
  </div>
)}

{/* HIDDEN IMPORT INPUT */}
      {!readOnly && (
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleImportFile}
        />
      )}

      {/* EDIT MODAL */}
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