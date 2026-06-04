'use client'

import { StatsCards } from '@/components/stats-cards'
import { PortfolioChart } from '@/components/portfolio-chart'
import { CardList } from '@/components/card-list'
import { DistributionChart } from '@/components/distribution-chart'
import { MarketMovers } from '@/components/market-movers'

export function DashboardSection({ userId }: { userId?: string }) {
  return (
    <div className="space-y-6">
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>
        <div>
          <DistributionChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardList userId={userId} />
        </div>
        <div>
          <MarketMovers />
        </div>
      </div>
    </div>
  )
}