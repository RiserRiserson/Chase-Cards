'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sampleCards } from '@/lib/card-data'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export function PortfolioChart() {
  // Aggregate price history across all cards
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05']
  const chartData = months.map((month, index) => {
    const totalValue = sampleCards.reduce((acc, card) => {
      const historyEntry = card.priceHistory[index]
      return acc + (historyEntry ? historyEntry.price * card.quantity : 0)
    }, 0)
    return {
      month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
      value: totalValue,
    }
  })

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Portfolio Value Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.88 0.18 95)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.88 0.18 95)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
              <XAxis
                dataKey="month"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.18 0.01 250)',
                  border: '1px solid oklch(0.28 0.01 250)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                labelStyle={{ color: 'oklch(0.65 0 0)' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.88 0.18 95)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
