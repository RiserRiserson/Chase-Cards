'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sampleCards, gameLabels, type CardGame } from '@/lib/card-data'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

export function DistributionChart() {
  // Group cards by game type
  const gameDistribution = sampleCards.reduce(
    (acc, card) => {
      const value = card.marketValue * card.quantity
      acc[card.game] = (acc[card.game] || 0) + value
      return acc
    },
    {} as Record<CardGame, number>
  )

  const chartData = Object.entries(gameDistribution).map(([game, value]) => ({
    name: gameLabels[game as CardGame],
    value,
  }))

  const COLORS = ['oklch(0.88 0.18 95)', 'oklch(0.7 0.15 160)', 'oklch(0.6 0.15 260)']

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Collection by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.18 0.01 250)',
                  border: '1px solid oklch(0.28 0.01 250)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Legend
                formatter={(value) => <span style={{ color: 'oklch(0.98 0 0)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
