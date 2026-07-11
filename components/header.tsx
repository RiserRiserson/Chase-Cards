'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  X
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface HeaderProps {
  onMenuToggle?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  searchPlaceholder?: string
  searchEnabled?: boolean
}

export function Header({
  onMenuToggle,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search cards...',
  searchEnabled = true
}: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const clearSearch = () => {
    onSearchChange?.('')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchValue}
            onChange={event =>
              onSearchChange?.(event.target.value)
            }
            onKeyDown={event => {
              if (event.key !== 'Enter') return

              event.preventDefault()

              if (!searchValue.trim()) return

              onSearchSubmit?.()
            }}
            placeholder={searchPlaceholder}
            disabled={!searchEnabled}
            className="w-64 border-border bg-secondary pl-9 pr-9"
          />

          {searchEnabled && searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">
        {/* THEME TOGGLE */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {!mounted ? null : resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* NOTIFICATIONS */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* UPGRADE */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden sm:flex"
        >
          Upgrade to Pro
        </Button>
      </div>
    </header>
  )
}