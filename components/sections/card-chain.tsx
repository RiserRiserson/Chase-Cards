'use client'

import { useState } from 'react'

type TradeEventType = 'trade' | 'sale' | 'grading'

type CardNode = {
  id: string
  cardName: string
  imageUrl?: string
  acquiredDate: string

  event: {
    type: TradeEventType
    notes?: string
    value?: number
  }

  next?: CardNode
}

type TradeChain = {
  id: string
  root: CardNode
}

const MOCK_CHAINS: TradeChain[] = [
  {
    id: 'chain-1',
    root: {
      id: '1',
      cardName: 'Connor McDavid Rookie',
      imageUrl: '',
      acquiredDate: '2024-01-10',
      event: {
        type: 'trade',
        notes: 'Pulled from pack'
      },
      next: {
        id: '2',
        cardName: 'Leon Draisaitl Auto',
        imageUrl: '',
        acquiredDate: '2024-02-18',
        event: {
          type: 'trade',
          notes: '1-for-1 trade'
        }
      }
    }
  }
]

function getLatest(node: CardNode): CardNode {
  let current = node
  while (current.next) current = current.next
  return current
}

function buildHistory(node: CardNode): CardNode[] {
  const out: CardNode[] = []
  let current: CardNode | undefined = node

  while (current) {
    out.push(current)
    current = current.next
  }

  return out
}

export function CardChain() {
  const [chains, setChains] = useState<TradeChain[]>(MOCK_CHAINS)
  const [historyOpen, setHistoryOpen] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<
    'new-chain' | 'new-node' | 'edit-node'
  >('new-chain')

  const [activeChainId, setActiveChainId] = useState<string | null>(null)

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingChainId, setEditingChainId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [draggedId, setDraggedId] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setNotes('')
    setDate('')
    setImageUrl('')
    setActiveChainId(null)
    setEditingNodeId(null)
    setEditingChainId(null)
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    const reader = new FileReader()

    reader.onloadend = () => {
      setImageUrl(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const addChain = () => {
    if (!name || !date) return

    const newChain: TradeChain = {
      id: crypto.randomUUID(),
      root: {
        id: crypto.randomUUID(),
        cardName: name,
        imageUrl,
        acquiredDate: date,
        event: {
          type: 'trade',
          notes
        }
      }
    }

    setChains(prev => [...prev, newChain])

    reset()
    setShowModal(false)
  }

  const addNode = () => {
    if (!activeChainId || !name || !date) return

    const newNode: CardNode = {
      id: crypto.randomUUID(),
      cardName: name,
      imageUrl,
      acquiredDate: date,
      event: {
        type: 'trade',
        notes
      }
    }

    setChains(prev => {
      const copy = structuredClone(prev)

      const chain = copy.find(c => c.id === activeChainId)

      if (!chain) return prev

      let cur = chain.root

      while (cur.next) {
        cur = cur.next
      }

      cur.next = newNode

      return copy
    })

    reset()
    setShowModal(false)
  }

  const saveEditNode = () => {
    if (!editingChainId || !editingNodeId || !name || !date) return

    setChains(prev => {
      const copy = structuredClone(prev)

      const chain = copy.find(c => c.id === editingChainId)

      if (!chain) return prev

      const updateNode = (
        node?: CardNode
      ): CardNode | undefined => {
        if (!node) return undefined

        if (node.id === editingNodeId) {
          return {
            ...node,
            cardName: name,
            imageUrl,
            acquiredDate: date,
            event: {
              ...node.event,
              notes
            }
          }
        }

        node.next = updateNode(node.next)

        return node
      }

      chain.root = updateNode(chain.root) as CardNode

      return copy
    })

    reset()
    setShowModal(false)
  }

  const deleteChain = (id: string) => {
    const ok = window.confirm(
      'Delete this entire trade chain? This cannot be undone.'
    )

    if (!ok) return

    setChains(prev => prev.filter(c => c.id !== id))
  }

  const deleteNode = (chainId: string, nodeId: string) => {
    const ok = window.confirm(
      'Delete this card from the chain?'
    )

    if (!ok) return

    setChains(prev => {
      const copy = structuredClone(prev)

      const chain = copy.find(c => c.id === chainId)

      if (!chain) return prev

      const remove = (
        node?: CardNode
      ): CardNode | undefined => {
        if (!node) return undefined

        if (node.id === nodeId) {
          return node.next
        }

        node.next = remove(node.next)

        return node
      }

      chain.root = remove(chain.root) as CardNode

      return copy
    })
  }

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    setChains(prev => {
      const arr = [...prev]

      const from = arr.findIndex(c => c.id === draggedId)
      const to = arr.findIndex(c => c.id === targetId)

      if (from === -1 || to === -1) return prev

      const moved = arr.splice(from, 1)[0]

      arr.splice(to, 0, moved)

      return arr
    })

    setDraggedId(null)
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h2 className="text-2xl font-semibold">
          Card Chain
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          Multi-chain trade tracking system
        </p>
      </div>

      <button
        onClick={() => {
          setModalMode('new-chain')
          setShowModal(true)
        }}
        className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground"
      >
        Add Card
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-4 w-full max-w-md space-y-3">

            <h3 className="font-semibold">
              {modalMode === 'new-chain'
                ? 'Add New Card'
                : modalMode === 'edit-node'
                ? 'Edit Node'
                : 'Add Node'}
            </h3>

            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Card name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={date}
              onChange={e => setDate(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border rounded px-3 py-2 text-sm"
            />

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-28 h-40 object-cover rounded border"
              />
            )}

            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">

              <button
                onClick={() => {
                  setShowModal(false)
                  reset()
                }}
                className="px-3 py-1 text-sm border rounded"
              >
                Cancel
              </button>

              <button
                onClick={
                  modalMode === 'new-chain'
                    ? addChain
                    : modalMode === 'edit-node'
                    ? saveEditNode
                    : addNode
                }
                className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
              >
                Save
              </button>

            </div>

          </div>
        </div>
      )}

      <div className="space-y-4">

        {chains.map(chain => {
          const latest = getLatest(chain.root)
          const history = buildHistory(chain.root)

          return (
            <div
              key={chain.id}
              className="border rounded-lg p-4 bg-card space-y-3"
              draggable
              onDragStart={() => setDraggedId(chain.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(chain.id)}
            >

              <div className="flex gap-4 items-start">

                {latest.imageUrl ? (
                  <img
                    src={latest.imageUrl}
                    alt={latest.cardName}
                    className="w-20 h-28 object-cover rounded border"
                  />
                ) : (
                  <div className="w-20 h-28 rounded border bg-muted" />
                )}

                <div>

                  <div className="text-lg font-medium">
                    {latest.cardName}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Acquired: {latest.acquiredDate}
                  </div>

                </div>

              </div>

              <div className="flex gap-2 flex-wrap pt-2">

                <button
                  onClick={() =>
                    setHistoryOpen(
                      historyOpen === chain.id
                        ? null
                        : chain.id
                    )
                  }
                  className="px-3 py-1 text-sm border rounded"
                >
                  History
                </button>

                <button
                  onClick={() => {
                    setModalMode('new-node')
                    setActiveChainId(chain.id)
                    setShowModal(true)
                  }}
                  className="px-3 py-1 text-sm border rounded"
                >
                  Add Node
                </button>

                <button
                  onClick={() => deleteChain(chain.id)}
                  className="px-3 py-1 text-sm text-red-500"
                >
                  Delete Chain
                </button>

              </div>

              {historyOpen === chain.id && (
                <div className="border-l pl-4 space-y-6">

                  {history.map((node, index) => {
                    const isLast =
                      index === history.length - 1

                    return (
                      <div
                        key={node.id}
                        className="flex gap-3 items-start"
                      >

                        <div className="flex flex-col items-center pt-1 relative">
                          <div className="w-3 h-3 rounded-full bg-primary z-10" />

                          {!isLast && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>

                        <div className="flex-1">

                          <div className="flex gap-4 items-start">

                            {node.imageUrl ? (
                              <img
                                src={node.imageUrl}
                                alt={node.cardName}
                                className="w-20 h-28 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-20 h-28 rounded border bg-muted" />
                            )}

                            <div className="flex-1">

                              <div className="font-medium">
                                {node.cardName}
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {node.acquiredDate}
                              </div>

                              {node.event.notes && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {node.event.notes}
                                </div>
                              )}

                              <div className="flex gap-3 mt-2">

                                <button
                                  onClick={() => {
                                    setModalMode('edit-node')

                                    setEditingChainId(chain.id)
                                    setEditingNodeId(node.id)

                                    setName(node.cardName)
                                    setDate(node.acquiredDate)
                                    setNotes(node.event.notes || '')
                                    setImageUrl(node.imageUrl || '')

                                    setShowModal(true)
                                  }}
                                  className="text-xs text-blue-500"
                                >
                                  edit
                                </button>

                                <button
                                  onClick={() =>
                                    deleteNode(
                                      chain.id,
                                      node.id
                                    )
                                  }
                                  className="text-xs text-red-500"
                                >
                                  delete
                                </button>

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                    )
                  })}

                </div>
              )}

            </div>
          )
        })}

      </div>
    </div>
  )
}