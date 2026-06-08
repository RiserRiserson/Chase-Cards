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

  // These colors are fine (data colors, not text/UI colors)
  const COLORS = [
    'oklch(0.88 0.18 95)',
    'oklch(0.7 0.15 160)',
    'oklch(0.6 0.15 260)',
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Collection by Type</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-65">
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              {/* ✅ THEME-AWARE TOOLTIP */}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--card-foreground)',
                }}
                itemStyle={{
                  color: 'var(--card-foreground)',
                }}
                labelStyle={{
                  color: 'var(--foreground)',
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  'Value',
                ]}
              />

              {/* ✅ THEME-AWARE LEGEND */}
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'var(--foreground)' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}