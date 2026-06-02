'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StatsCards } from '@/components/stats-cards'
import { PortfolioChart } from '@/components/portfolio-chart'
import { CardList } from '@/components/card-list'
import { DistributionChart } from '@/components/distribution-chart'
import { MarketMovers } from '@/components/market-movers'
import { addCard } from '@/lib/addCard'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
const [refreshKey, setRefreshKey] = useState(0)

  const handleAddTestCard = async () => {
  await addCard({
    name: 'Test Card',
    game: 'pokemon',
    set: 'Test Set',
    year: 2024,
    condition: 'mint',
    marketValue: 100,
    purchasePrice: 50,
    quantity: 1,
    rarity: 'Test Rare',
    imageUrl: ''
  })

  setRefreshKey(prev => prev + 1)
}

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
  activeTab={activeTab}
  onTabChange={setActiveTab}
  onAddCard={handleAddTestCard}
/>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your trading card collection performance
            </p>
          </div>

          <div className="space-y-6">
            {/* Stats Row */}
            <StatsCards />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PortfolioChart />
              </div>
              <div>
                <DistributionChart />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CardList refreshKey={refreshKey} />
              </div>
              <div>
                <MarketMovers />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
