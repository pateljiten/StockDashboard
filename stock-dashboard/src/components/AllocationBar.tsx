'use client'

import { useMemo } from 'react'
import { StockHolding } from '@/types/portfolio'

// Vibrant color palette matching the donut chart
const COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#A855F7', '#22C55E', '#0EA5E9', '#FBBF24',
  '#E11D48', '#7C3AED', '#059669', '#DC2626', '#2563EB',
  '#D946EF', '#65A30D', '#0891B2', '#9333EA', '#16A34A',
]

type AllocationBarProps = {
  holdings: StockHolding[]
}

const AllocationBar = ({ holdings }: AllocationBarProps) => {
  const sortedHoldings = useMemo(() => {
    return [...holdings]
      .filter(h => h.allocationPercent > 0)
      .sort((a, b) => b.allocationPercent - a.allocationPercent)
  }, [holdings])

  return (
    <div className="h-10 w-full overflow-hidden rounded-lg">
      <div className="flex h-full w-full">
        {sortedHoldings.map((holding, index) => (
          <div
            key={holding.ticker}
            className="group relative h-full transition-all duration-200 hover:opacity-80"
            style={{
              width: `${holding.allocationPercent}%`,
              backgroundColor: COLORS[index % COLORS.length],
            }}
            role="img"
            aria-label={`${holding.ticker}: ${holding.allocationPercent.toFixed(2)}%`}
          >
            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                <span className="font-medium">{holding.ticker}</span>
                <span className="ml-1 text-gray-300">
                  {holding.allocationPercent.toFixed(2)}%
                </span>
              </div>
              <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllocationBar

