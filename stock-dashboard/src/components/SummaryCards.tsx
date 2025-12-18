'use client'

import { PortfolioSummary } from '@/types/portfolio'
import { formatCurrency, formatPercent, getValueColorClass } from '@/utils/formatters'

type SummaryCardProps = {
  label: string
  value: string
  subValue?: string
  valueColorClass?: string
}

const SummaryCard = ({ label, value, subValue, valueColorClass = 'text-gray-900' }: SummaryCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
        {label}
      </span>
      <span className={`text-2xl font-bold ${valueColorClass}`}>
        {value}
      </span>
      {subValue && (
        <span className={`mt-1 text-sm font-medium ${valueColorClass}`}>
          {subValue}
        </span>
      )}
    </div>
  )
}

type SummaryCardsProps = {
  summary: PortfolioSummary
}

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label="Invested"
          value={formatCurrency(summary.invested)}
        />
        <SummaryCard
          label="Current"
          value={formatCurrency(summary.current)}
        />
        <SummaryCard
          label="Realised P&L"
          value={formatCurrency(summary.realisedPnL, true)}
          subValue={formatPercent(summary.realisedPnLPercent)}
          valueColorClass={getValueColorClass(summary.realisedPnL)}
        />
        <SummaryCard
          label="Unrealised P&L"
          value={formatCurrency(summary.unrealisedPnL, true)}
          subValue={formatPercent(summary.unrealisedPnLPercent)}
          valueColorClass={getValueColorClass(summary.unrealisedPnL)}
        />
        <SummaryCard
          label="Net P&L"
          value={formatCurrency(summary.netPnL, true)}
          subValue={formatPercent(summary.netPnLPercent)}
          valueColorClass={getValueColorClass(summary.netPnL)}
        />
      </div>
    </div>
  )
}

export default SummaryCards

