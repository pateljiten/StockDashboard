'use client'

import { useState } from 'react'
import { CashPosition, PortfolioView } from '@/types/portfolio'
import { formatCurrency } from '@/utils/formatters'
import { Pencil, Check, X, Wallet, BarChart3, PieChart } from 'lucide-react'

type CashPositionReturnsProps = {
  cashPosition: CashPosition
  numberOfScripts: number
  currentValue: number
  currentView: PortfolioView
  onUpdateCashPosition?: (amount: number) => void
}

const CashPositionReturns = ({ 
  cashPosition, 
  numberOfScripts, 
  currentValue,
  currentView,
  onUpdateCashPosition 
}: CashPositionReturnsProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(cashPosition.cashPosition)

  const isConsolidated = currentView === 'consolidated'
  const canEdit = !isConsolidated && onUpdateCashPosition

  // Total Portfolio Size = Current Value + Cash Position
  const totalPortfolioSize = currentValue + cashPosition.cashPosition

  const handleStartEdit = () => {
    setEditValue(cashPosition.cashPosition)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (onUpdateCashPosition) {
      onUpdateCashPosition(editValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(cashPosition.cashPosition)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Portfolio Overview</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Portfolio Size Card */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-violet-50 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <PieChart className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Portfolio Size
            </span>
            <span className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalPortfolioSize)}
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              Current + Cash
            </span>
          </div>
        </div>

        {/* Cash Position Card */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Wallet className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Cash Position
              </span>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-lg text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                    onKeyDown={handleKeyDown}
                    className="w-28 rounded border border-emerald-300 px-2 py-1 text-xl font-bold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                    aria-label="Edit cash position"
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(cashPosition.cashPosition)}
                </span>
              )}
              {isConsolidated && !isEditing && (
                <span className="mt-1 block text-xs text-gray-500">
                  Sum of both portfolios
                </span>
              )}
            </div>
          </div>
          
          {/* Edit Controls */}
          {canEdit && (
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="rounded bg-emerald-500 p-1.5 text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                    aria-label="Save cash position"
                    title="Save (Enter)"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded bg-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                    aria-label="Cancel edit"
                    title="Cancel (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="rounded bg-white/80 p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                  aria-label="Edit cash position"
                  title="Edit cash position"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Number of Scripts Card */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Number of Scripts
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {numberOfScripts}
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              Unique stock tickers
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashPositionReturns
