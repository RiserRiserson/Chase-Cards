'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

import {
  Layers,
  Home,
  Plus,
  Search,
  GitBranch,
  Gift,
  Calendar,
  Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAddCard: () => void
  userEmail?: string
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'collection', label: 'Collection', icon: Layers },
  { id: 'card-analysis', label: 'Card Analysis', icon: Search },
  { id: 'trade-tree', label: 'Trade Tree', icon: GitBranch },
  { id: 'chase-cards', label: 'Chase Cards', icon: Sparkles },
  { id: 'upcoming-events', label: 'Upcoming Events', icon: Calendar },
  { id: 'rewards', label: 'Rewards', icon: Gift },
]

const APP_NAME = 'ChaseCards'

export function Sidebar({
  activeTab,
  onTabChange,
  onAddCard,
  userEmail
}: SidebarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // IMPORTANT: always render same DOM structure
  const initials =
    mounted && userEmail ? userEmail.slice(0, 2).toUpperCase() : 'CC'

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-sidebar min-h-screen">

      {/* APP HEADER */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary-foreground" />
        </div>

        <span className="text-lg font-semibold text-sidebar-foreground">
          {APP_NAME}
        </span>
      </div>

      {/* ADD CARD BUTTON */}
      <div className="px-4 py-4">
        <Button className="w-full gap-2" size="sm" onClick={onAddCard}>
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-sidebar-accent text-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* USER AREA */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userEmail || 'Guest User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Collector
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}