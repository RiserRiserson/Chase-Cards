'use client'

import { useMemo, useState } from 'react'

type TradeEventType = 'origin' | 'trade' | 'sale' | 'grading'

type CardNode = {
  id: string
  cardName: string
  acquiredDate: string

  event?: {
    type: TradeEventType
    fromUser?: string
    toUser?: string
    value?: number
    grade?: string
    notes?: string
    certId?: string
  }

  children?: CardNode[]
}

/**
 * SAMPLE TRADE TREE (branching enabled)
 * McDavid -> Draisaitl -> (branch A / branch B)
 */
const MOCK_TREE: CardNode = {
  id: '1',
  cardName: 'Connor McDavid Rookie',
  acquiredDate: '2024-01-10',
  event: {
    type: 'origin',
    notes: 'Pulled from hobby pack'
  },
  children: [
    {
      id: '2',
      cardName: 'Leon Draisaitl Auto',
      acquiredDate: '2024-02-18',
      event: {
        type: 'trade',
        fromUser: 'CollectorA',
        toUser: 'CollectorB',
        notes: '1-for-1 trade'
      },
      children: [
        {
          id: '3a',
          cardName: 'NHL Patch Card /25',
          acquiredDate: '2024-05-02',
          event: {
            type: 'trade',
            fromUser: 'CollectorB',
            toUser: 'CollectorC',
            value: 420
          },
          children: [
            {
              id: '4a',
              cardName: 'Wayne Gretzky Insert',
              acquiredDate: '2024-09-01',
              event: {
                type: 'sale',
                fromUser: 'CollectorC',
                toUser: 'BuyerD',
                value: 900
              }
            }
          ]
        },
        {
          id: '3b',
          cardName: 'Connor Bedard Rookie',
          acquiredDate: '2024-05-02',
          event: {
            type: 'trade',
            fromUser: 'CollectorB',
            toUser: 'CollectorE',
            notes: 'Alternate trade path'
          }
        }
      ]
    }
  ]
}

function getColor(type: TradeEventType) {
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

function getLabel(type: TradeEventType) {
  switch (type) {
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

/**
 * Find path from root -> selected node
 */
function findPath(
  node: CardNode,
  targetId: string,
  path: CardNode[] = []
): CardNode[] | null {
  const newPath = [...path, node]

  if (node.id === targetId) return newPath

  for (const child of node.children ?? []) {
    const result = findPath(child, targetId, newPath)
    if (result) return result
  }

  return null
}

/**
 * Flatten subtree from a node
 */
function flatten(node: CardNode): CardNode[] {
  const result: CardNode[] = []
  const stack: CardNode[] = [node]

  while (stack.length) {
    const current = stack.shift()!
    result.push(current)
    if (current.children) {
      stack.push(...current.children)
    }
  }

  return result
}

export function TradeTree() {
  const [root] = useState<CardNode>(MOCK_TREE)
  const [currentId, setCurrentId] = useState<string>(MOCK_TREE.id)
  const [viewMode, setViewMode] = useState<'card' | 'history'>('card')

  const currentPath = useMemo(() => {
    return findPath(root, currentId) ?? [root]
  }, [root, currentId])

  const currentNode = currentPath[currentPath.length - 1]

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Trade Tree</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track how a card evolves through trades, sales, and grading paths
        </p>
      </div>

      {/* CURRENT CARD VIEW */}
      {viewMode === 'card' && (
        <div className="border rounded-lg p-6 bg-card space-y-4">

          <div>
            <div className="text-lg font-medium">
              {currentNode.cardName}
            </div>

            <div className="text-sm text-muted-foreground">
              Acquired: {currentNode.acquiredDate}
            </div>
          </div>

          {/* EVENT DETAILS */}
          {currentNode.event && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                Type: {getLabel(currentNode.event.type)}
              </div>

              {currentNode.event.notes && (
                <div>Notes: {currentNode.event.notes}</div>
              )}

              {currentNode.event.value && (
                <div>Value: ${currentNode.event.value}</div>
              )}

              {currentNode.event.grade && (
                <div>Grade: {currentNode.event.grade}</div>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 flex-wrap">

            <button
              className="text-sm underline"
              onClick={() => setViewMode('history')}
            >
              View History
            </button>

            {currentPath.length > 1 && (
              <button
                className="text-sm underline"
                onClick={() =>
                  setCurrentId(currentPath[currentPath.length - 2].id)
                }
              >
                ← Go Back
              </button>
            )}
          </div>

          {/* CHILDREN (TRADE OPTIONS) */}
          {currentNode.children && currentNode.children.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm font-medium">
                Trade Options
              </div>

              {currentNode.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setCurrentId(child.id)}
                  className="w-full text-left p-3 rounded border hover:bg-muted"
                >
                  <div className="font-medium">
                    {child.cardName}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {child.event?.type} • {child.acquiredDate}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HISTORY VIEW */}
      {viewMode === 'history' && (
        <div className="space-y-6">

          <div className="flex gap-2">
            <button
              className="text-sm underline"
              onClick={() => setViewMode('card')}
            >
              Back to Card
            </button>
          </div>

          <div className="space-y-6 border-l pl-4">
            {currentPath.map((node, index) => {
              const isLast = index === currentPath.length - 1

              return (
                <div key={node.id} className="space-y-1">

                  <div className="flex items-center gap-2 flex-wrap">

                    <div
                      className={`w-3.5 h-3.5 rounded-full ${getColor(
                        node.event?.type ?? 'origin'
                      )}`}
                    />

                    <span className="font-medium">
                      {node.cardName}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {node.acquiredDate}
                    </span>
                  </div>

                  {node.event?.notes && (
                    <div className="text-sm text-muted-foreground pl-6">
                      {node.event.notes}
                    </div>
                  )}

                  {!isLast && (
                    <div className="text-xs text-muted-foreground pl-6">
                      ↓
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}