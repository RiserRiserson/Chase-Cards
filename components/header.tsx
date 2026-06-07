'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            className="pl-9 w-64 bg-secondary border-border"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        {/* THEME TOGGLE */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setTheme(theme === 'dark' ? 'light' : 'dark')
          }
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* NOTIFICATIONS */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* UPGRADE */}
        <Button variant="outline" size="sm" className="hidden sm:flex">
          Upgrade to Pro
        </Button>

      </div>
    </header>
  )
}