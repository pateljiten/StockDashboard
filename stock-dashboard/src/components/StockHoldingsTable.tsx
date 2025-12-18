'use client'

import { useState, useMemo } from 'react'
import { StockHolding, PortfolioView } from '@/types/portfolio'
import { formatCurrency, formatPercent, formatNumber, getValueColorClass } from '@/utils/formatters'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Check, X, Trash2, Plus } from 'lucide-react'

type SortField = 'ticker' | 'name' | 'qty' | 'avgBuyPrice' | 'ltp' | 'buyValue' | 'presentValue' | 'pnlPercent' | 'allocationPercent' | 'priceChangePercent'
type SortDirection = 'asc' | 'desc' | null

type SortConfig = {
  field: SortField
  direction: SortDirection
}

type EditingState = {
  ticker: string
  ltp: number
  qty: number
  buyValue: number
}

type HoldingUpdate = {
  ticker: string
  ltp?: number
  qty?: number
  buyValue?: number
}

type NewHolding = {
  ticker: string
  name: string
  qty: number
  avgBuyPrice: number
  ltp: number
}

type StockHoldingsTableProps = {
  holdings: StockHolding[]
  currentView: PortfolioView
  onUpdateHolding: (portfolioId: 'portfolio1' | 'portfolio2' | 'consolidated', update: HoldingUpdate) => void
  onDeleteHolding: (portfolioId: 'portfolio1' | 'portfolio2' | 'consolidated', ticker: string) => void
  onAddHolding?: (portfolioId: 'portfolio1' | 'portfolio2', holding: NewHolding) => void
}

type SortableHeaderProps = {
  label: string
  field: SortField
  sortConfig: SortConfig
  onSort: (field: SortField) => void
  align?: 'left' | 'right' | 'center'
  width: string
}

const SortableHeader = ({ label, field, sortConfig, onSort, align = 'left', width }: SortableHeaderProps) => {
  const isActive = sortConfig.field === field && sortConfig.direction !== null
  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'

  const handleClick = () => onSort(field)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSort(field)
    }
  }

  return (
    <th
      style={{ width }}
      className="cursor-pointer select-none px-3 py-3 transition-colors hover:bg-gray-100"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="columnheader"
      aria-sort={isActive ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <div className={`flex items-center gap-1 ${alignClass}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">
          {label}
        </span>
        <span className="text-gray-400 flex-shrink-0">
          {isActive ? (
            sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          )}
        </span>
      </div>
    </th>
  )
}

const StockHoldingsTable = ({ holdings, currentView, onUpdateHolding, onDeleteHolding, onAddHolding }: StockHoldingsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'allocationPercent',
    direction: 'desc',
  })
  const [editingRow, setEditingRow] = useState<EditingState | null>(null)
  const [deletingTicker, setDeletingTicker] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newHolding, setNewHolding] = useState<NewHolding>({
    ticker: '',
    name: '',
    qty: 0,
    avgBuyPrice: 0,
    ltp: 0,
  })

  const isConsolidated = currentView === 'consolidated'
  const canAddNew = !isConsolidated && onAddHolding

  const handleSort = (field: SortField) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        const nextDirection = prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        return { field, direction: nextDirection }
      }
      return { field, direction: 'asc' }
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStartEdit = (holding: StockHolding) => {
    setEditingRow({
      ticker: holding.ticker,
      ltp: holding.ltp,
      qty: holding.qty,
      buyValue: holding.buyValue,
    })
  }

  const handleCancelEdit = () => {
    setEditingRow(null)
  }

  const handleSaveEdit = () => {
    if (!editingRow) return

    onUpdateHolding(currentView, {
      ticker: editingRow.ticker,
      ltp: editingRow.ltp,
      qty: editingRow.qty,
      buyValue: editingRow.buyValue,
    })

    setEditingRow(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleDeleteClick = (ticker: string) => {
    setDeletingTicker(ticker)
  }

  const handleConfirmDelete = (ticker: string) => {
    onDeleteHolding(currentView, ticker)
    setDeletingTicker(null)
  }

  const handleCancelDelete = () => {
    setDeletingTicker(null)
  }

  const handleStartAdd = () => {
    setNewHolding({
      ticker: '',
      name: '',
      qty: 0,
      avgBuyPrice: 0,
      ltp: 0,
    })
    setIsAddingNew(true)
  }

  const handleCancelAdd = () => {
    setIsAddingNew(false)
    setNewHolding({
      ticker: '',
      name: '',
      qty: 0,
      avgBuyPrice: 0,
      ltp: 0,
    })
  }

  const handleSaveAdd = () => {
    if (!onAddHolding || !newHolding.ticker || !newHolding.name || newHolding.qty <= 0) {
      return
    }

    // Check if ticker already exists
    if (holdings.some(h => h.ticker.toUpperCase() === newHolding.ticker.toUpperCase())) {
      alert(`Ticker ${newHolding.ticker.toUpperCase()} already exists in this portfolio.`)
      return
    }

    onAddHolding(currentView as 'portfolio1' | 'portfolio2', {
      ...newHolding,
      ticker: newHolding.ticker.toUpperCase(),
    })

    setIsAddingNew(false)
    setNewHolding({
      ticker: '',
      name: '',
      qty: 0,
      avgBuyPrice: 0,
      ltp: 0,
    })
  }

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveAdd()
    } else if (e.key === 'Escape') {
      handleCancelAdd()
    }
  }

  const filteredAndSortedHoldings = useMemo(() => {
    let result = [...holdings]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        h =>
          h.ticker.toLowerCase().includes(term) ||
          h.name.toLowerCase().includes(term)
      )
    }

    if (sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.field]
        const bValue = b[sortConfig.field]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        return 0
      })
    }

    return result
  }, [holdings, searchTerm, sortConfig])

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Stock Holdings</h3>
          {canAddNew && !isAddingNew && (
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              aria-label="Add new script"
            >
              <Plus className="h-4 w-4" />
              Add Script
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search holdings..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            aria-label="Search holdings"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full" style={{ minWidth: '1150px', tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 shadow-sm">
            <tr>
              <SortableHeader label="Ticker" field="ticker" sortConfig={sortConfig} onSort={handleSort} width="75px" />
              <SortableHeader label="Name" field="name" sortConfig={sortConfig} onSort={handleSort} width="160px" />
              <SortableHeader label="Qty" field="qty" sortConfig={sortConfig} onSort={handleSort} align="right" width="85px" />
              <SortableHeader label="Avg Price" field="avgBuyPrice" sortConfig={sortConfig} onSort={handleSort} align="right" width="100px" />
              <SortableHeader label="LTP" field="ltp" sortConfig={sortConfig} onSort={handleSort} align="right" width="100px" />
              <SortableHeader label="Buy Value" field="buyValue" sortConfig={sortConfig} onSort={handleSort} align="right" width="105px" />
              <SortableHeader label="Present Val" field="presentValue" sortConfig={sortConfig} onSort={handleSort} align="right" width="105px" />
              <SortableHeader label="P&L %" field="pnlPercent" sortConfig={sortConfig} onSort={handleSort} align="right" width="85px" />
              <SortableHeader label="Alloc %" field="allocationPercent" sortConfig={sortConfig} onSort={handleSort} align="right" width="80px" />
              <SortableHeader label="Change" field="priceChangePercent" sortConfig={sortConfig} onSort={handleSort} align="right" width="80px" />
              <th style={{ width: '60px' }} className="px-2 py-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Add New Script Row */}
            {isAddingNew && (
              <tr className="bg-emerald-50">
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    value={newHolding.ticker}
                    onChange={(e) => setNewHolding({ ...newHolding, ticker: e.target.value.toUpperCase() })}
                    onKeyDown={handleAddKeyDown}
                    placeholder="TICKER"
                    className="w-full rounded border border-emerald-300 px-2 py-1 text-sm font-semibold uppercase focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                    aria-label="Ticker symbol"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    value={newHolding.name}
                    onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                    onKeyDown={handleAddKeyDown}
                    placeholder="Company Name"
                    className="w-full rounded border border-emerald-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Company name"
                  />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <input
                    type="number"
                    step="0.0001"
                    value={newHolding.qty || ''}
                    onChange={(e) => setNewHolding({ ...newHolding, qty: parseFloat(e.target.value) || 0 })}
                    onKeyDown={handleAddKeyDown}
                    placeholder="0"
                    className="w-full rounded border border-emerald-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Quantity"
                  />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={newHolding.avgBuyPrice || ''}
                    onChange={(e) => setNewHolding({ ...newHolding, avgBuyPrice: parseFloat(e.target.value) || 0 })}
                    onKeyDown={handleAddKeyDown}
                    placeholder="0.00"
                    className="w-full rounded border border-emerald-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Average buy price"
                  />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={newHolding.ltp || ''}
                    onChange={(e) => setNewHolding({ ...newHolding, ltp: parseFloat(e.target.value) || 0 })}
                    onKeyDown={handleAddKeyDown}
                    placeholder="0.00"
                    className="w-full rounded border border-emerald-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="LTP"
                  />
                </td>
                <td className="px-3 py-2.5 text-right text-sm text-gray-400 italic whitespace-nowrap">
                  {formatCurrency(newHolding.qty * newHolding.avgBuyPrice)}
                </td>
                <td className="px-3 py-2.5 text-right text-sm text-gray-400 italic whitespace-nowrap">
                  {formatCurrency(newHolding.qty * newHolding.ltp)}
                </td>
                <td className="px-3 py-2.5 text-right text-sm text-gray-400 italic whitespace-nowrap">
                  {(() => {
                    const buyValue = newHolding.qty * newHolding.avgBuyPrice
                    const presentValue = newHolding.qty * newHolding.ltp
                    const pnl = buyValue > 0 ? ((presentValue - buyValue) / buyValue) * 100 : 0
                    return formatPercent(pnl)
                  })()}
                </td>
                <td className="px-3 py-2.5 text-right text-sm text-gray-400">-</td>
                <td className="px-3 py-2.5 text-right text-sm text-gray-400">-</td>
                <td className="px-2 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={handleSaveAdd}
                      disabled={!newHolding.ticker || !newHolding.name || newHolding.qty <= 0}
                      className="rounded bg-emerald-500 p-1 text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Save new script"
                      title="Save (Enter)"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      className="rounded bg-gray-200 p-1 text-gray-600 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      aria-label="Cancel"
                      title="Cancel (Esc)"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {filteredAndSortedHoldings.length === 0 && !isAddingNew ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No holdings match your search' : 'No holdings found'}
                </td>
              </tr>
            ) : (
              filteredAndSortedHoldings.map(holding => {
                const showPriceWarning = holding.hasPriceFetched === false && !holding.manuallyEdited
                const isEditing = editingRow?.ticker === holding.ticker
                const rowClassName = showPriceWarning
                  ? 'bg-red-50 transition-colors hover:bg-red-100'
                  : 'transition-colors hover:bg-gray-50'
                
                return (
                  <tr
                    key={holding.ticker}
                    className={rowClassName}
                    title={showPriceWarning ? 'Price could not be fetched - click edit to fix manually' : undefined}
                  >
                    {/* Ticker */}
                    <td className="px-3 py-2.5 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900 truncate">{holding.ticker}</span>
                        {showPriceWarning && (
                          <span className="flex-shrink-0 rounded bg-red-100 px-1 py-0.5 text-[10px] font-medium text-red-600" title="Price not available">!</span>
                        )}
                        {holding.manuallyEdited && (
                          <span className="flex-shrink-0 rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-600" title="Manually edited">✓</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td className="px-3 py-2.5 overflow-hidden">
                      <span className="text-sm text-blue-600 hover:underline block truncate" title={holding.name}>{holding.name}</span>
                    </td>
                    
                    {/* Qty */}
                    <td className="px-3 py-2.5 text-right text-sm text-gray-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.0001"
                          value={editingRow.qty}
                          onChange={e => setEditingRow({ ...editingRow, qty: parseFloat(e.target.value) || 0 })}
                          onKeyDown={handleEditKeyDown}
                          className="w-full rounded border border-emerald-300 px-1.5 py-1 text-right text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          aria-label="Edit quantity"
                        />
                      ) : (
                        <span className="whitespace-nowrap">{formatNumber(holding.qty)}</span>
                      )}
                    </td>
                    
                    {/* Avg Buy Price */}
                    <td className="px-3 py-2.5 text-right text-sm text-gray-700 whitespace-nowrap">
                      {formatCurrency(holding.avgBuyPrice)}
                    </td>
                    
                    {/* LTP */}
                    <td className={`px-3 py-2.5 text-right text-sm ${showPriceWarning ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editingRow.ltp}
                          onChange={e => setEditingRow({ ...editingRow, ltp: parseFloat(e.target.value) || 0 })}
                          onKeyDown={handleEditKeyDown}
                          className="w-full rounded border border-emerald-300 px-1.5 py-1 text-right text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          aria-label="Edit LTP"
                        />
                      ) : (
                        <span className="whitespace-nowrap">{formatCurrency(holding.ltp)}</span>
                      )}
                    </td>
                    
                    {/* Buy Value */}
                    <td className="px-3 py-2.5 text-right text-sm text-gray-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editingRow.buyValue}
                          onChange={e => setEditingRow({ ...editingRow, buyValue: parseFloat(e.target.value) || 0 })}
                          onKeyDown={handleEditKeyDown}
                          className="w-full rounded border border-emerald-300 px-1.5 py-1 text-right text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          aria-label="Edit buy value"
                        />
                      ) : (
                        <span className="whitespace-nowrap">{formatCurrency(holding.buyValue)}</span>
                      )}
                    </td>
                    
                    {/* Present Value */}
                    <td className="px-3 py-2.5 text-right text-sm text-gray-700 whitespace-nowrap">
                      {isEditing ? (
                        <span className="text-gray-400 italic">
                          {formatCurrency(editingRow.qty * editingRow.ltp)}
                        </span>
                      ) : (
                        formatCurrency(holding.presentValue)
                      )}
                    </td>
                    
                    {/* P&L % */}
                    <td className={`px-3 py-2.5 text-right text-sm font-medium whitespace-nowrap ${getValueColorClass(holding.pnlPercent)}`}>
                      {isEditing ? (
                        <span className="text-gray-400 italic">
                          {(() => {
                            const previewPV = editingRow.qty * editingRow.ltp
                            const pnl = editingRow.buyValue > 0 
                              ? ((previewPV - editingRow.buyValue) / editingRow.buyValue) * 100 
                              : 0
                            return formatPercent(pnl)
                          })()}
                        </span>
                      ) : (
                        formatPercent(holding.pnlPercent)
                      )}
                    </td>
                    
                    {/* Allocation % */}
                    <td className="px-3 py-2.5 text-right text-sm text-gray-700 whitespace-nowrap">
                      {formatPercent(holding.allocationPercent, false)}
                    </td>
                    
                    {/* Price Change */}
                    <td className={`px-3 py-2.5 text-right text-sm font-medium whitespace-nowrap ${getValueColorClass(holding.priceChangePercent)}`}>
                      {formatPercent(holding.priceChangePercent)}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-2 py-2.5 text-center">
                      {deletingTicker === holding.ticker ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleConfirmDelete(holding.ticker)}
                            className="rounded bg-red-500 p-1 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            aria-label="Confirm delete"
                            title="Confirm delete"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="rounded bg-gray-200 p-1 text-gray-600 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                            aria-label="Cancel delete"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={handleSaveEdit}
                            className="rounded bg-emerald-500 p-1 text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                            aria-label="Save changes"
                            title="Save (Enter)"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="rounded bg-gray-200 p-1 text-gray-600 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                            aria-label="Cancel edit"
                            title="Cancel (Esc)"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(holding)}
                            className="rounded bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                            aria-label={`Edit ${holding.ticker}`}
                            title="Edit values"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(holding.ticker)}
                            className="rounded bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                            aria-label={`Delete ${holding.ticker}`}
                            title="Delete script"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-100" />
          <span>Price fetch failed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-600">✓</span>
          <span>Manually edited</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-gray-400">
          <span><Pencil className="inline h-3 w-3" /> Edit</span>
          <span><Trash2 className="inline h-3 w-3" /> Delete</span>
        </div>
      </div>
    </div>
  )
}

export default StockHoldingsTable
