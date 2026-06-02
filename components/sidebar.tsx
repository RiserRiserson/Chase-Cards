'use client'

import { cn } from '@/lib/utils'
import { Layers, BarChart3, Settings, Home, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAddCard: () => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'collection', label: 'Collection', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange, onAddCard }: SidebarProps) {
  return (
    <aside className="flex flex-col w-64 border-r border-border bg-sidebar min-h-screen">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">CardVault</span>
      </div>

      <div className="px-4 py-4">
  <Button className="w-full gap-2" size="sm" onClick={onAddCard}>
    <Plus className="w-4 h-4" />
    Add Card
  </Button>
</div>

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

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Pro Collector</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
