'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  DragEndEvent
} from '@dnd-kit/core'

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

import { StatsCards } from '@/components/stats-cards'
import { PortfolioChart } from '@/components/portfolio-chart'
import { CardList } from '@/components/card-list'
import { DistributionChart } from '@/components/distribution-chart'
import { MarketMovers } from '@/components/market-movers'
import { AttributeHeatmap } from '@/components/AttributeHeatmap'

type WidgetKey =
  | 'stats'
  | 'portfolio'
  | 'distribution'
  | 'heatmap'
  | 'cards'
  | 'market'

const defaultLayout: WidgetKey[] = [
  'portfolio',
  'distribution',
  'heatmap',
  'cards',
  'market'
]

export function DashboardSection({ userId }: { userId?: string }) {
  const [layout, setLayout] = useState<WidgetKey[]>(defaultLayout)
  const [mounted, setMounted] = useState(false)

  /* MOUNT GUARD (fix hydration + dnd-kit mismatch) */
  useEffect(() => {
    setMounted(true)
  }, [])

  /* LOAD */
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_layout')
    if (saved) {
      try {
        setLayout(JSON.parse(saved))
      } catch {
        setLayout(defaultLayout)
      }
    }
  }, [])

  /* SAVE */
  useEffect(() => {
    localStorage.setItem('dashboard_layout', JSON.stringify(layout))
  }, [layout])

  /* DRAG */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = layout.indexOf(active.id as WidgetKey)
    const newIndex = layout.indexOf(over.id as WidgetKey)

    setLayout(arrayMove(layout, oldIndex, newIndex))
  }

  const renderWidget = (key: WidgetKey) => {
    switch (key) {
      case 'portfolio':
        return <PortfolioChart userId={userId} />
      case 'distribution':
        return <DistributionChart userId={userId} />
      case 'heatmap':
        return <AttributeHeatmap userId={userId} />
      case 'cards':
        return <CardList userId={userId} />
      case 'market':
        return <MarketMovers userId={userId} />
    }
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="space-y-6">

      {/* TOP ROW (always render) */}
      <div>
        <StatsCards userId={userId} />
      </div>

      {/* DND ONLY AFTER MOUNT (fix hydration mismatch) */}
      {mounted && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={layout} strategy={verticalListSortingStrategy}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {layout.map((key) => (
                <SortableItem key={key} id={key}>
                  {renderWidget(key)}
                </SortableItem>
              ))}

            </div>

          </SortableContext>
        </DndContext>
      )}

    </div>
  )
}

/* ---------------- SORTABLE ITEM ---------------- */

function SortableItem({
  id,
  children
}: {
  id: string
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className={`
        relative
        col-span-1
        ${isDragging ? 'opacity-60' : 'opacity-100'}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-2 right-2 text-xs text-muted-foreground cursor-grab select-none">
        ⋮⋮
      </div>

      {children}
    </div>
  )
}