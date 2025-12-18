'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { StockHolding } from '@/types/portfolio'
import { formatPercent } from '@/utils/formatters'

// Vibrant color palette for the donut chart
const COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#A855F7', '#22C55E', '#0EA5E9', '#FBBF24',
  '#E11D48', '#7C3AED', '#059669', '#DC2626', '#2563EB',
  '#D946EF', '#65A30D', '#0891B2', '#9333EA', '#16A34A',
]

type AllocationChartProps = {
  holdings: StockHolding[]
}

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{
    payload: {
      ticker: string
      name: string
      value: number
    }
  }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="font-semibold text-gray-900">{data.ticker}</p>
      <p className="text-sm text-gray-600">{data.name}</p>
      <p className="text-sm font-medium text-emerald-600">
        {formatPercent(data.value, false)}
      </p>
    </div>
  )
}

const AllocationChart = ({ holdings }: AllocationChartProps) => {
  const chartData = useMemo(() => {
    return holdings
      .filter(h => h.allocationPercent > 0)
      .sort((a, b) => b.allocationPercent - a.allocationPercent)
      .map(holding => ({
        ticker: holding.ticker,
        name: holding.name,
        value: holding.allocationPercent,
      }))
  }, [holdings])

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Allocation</h3>
      <div className="flex flex-col items-center gap-6 lg:flex-row">
        {/* Donut Chart */}
        <div className="relative h-64 w-64 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={1}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">Allocation</span>
          </div>
        </div>

        {/* Legend */}
        <div className="max-h-64 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {chartData.map((item, index) => (
              <div
                key={item.ticker}
                className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-50"
              >
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.ticker}
                </span>
                <span className="text-sm text-gray-500">
                  ({formatPercent(item.value, false)})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllocationChart

