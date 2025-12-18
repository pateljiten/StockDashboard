'use client'

import { useState } from 'react'
import { Database, Upload, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import FileUpload from './FileUpload'

type DataSourceSelectorProps = {
  onUpload: (file: File, portfolioId: 'portfolio1' | 'portfolio2', portfolioName: string) => Promise<void>
  onUseMockData: () => void
  onClearData: () => void
  isLoading: boolean
  hasPortfolio1: boolean
  hasPortfolio2: boolean
}

const DataSourceSelector = ({
  onUpload,
  onUseMockData,
  onClearData,
  isLoading,
  hasPortfolio1,
  hasPortfolio2,
}: DataSourceSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(!hasPortfolio1 && !hasPortfolio2)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleToggleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  const handleUseMockData = () => {
    onUseMockData()
    setIsExpanded(false)
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all portfolio data? This cannot be undone.')) {
      onClearData()
    }
  }

  const hasAnyData = hasPortfolio1 || hasPortfolio2

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={handleToggle}
        onKeyDown={handleToggleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Data Source</h3>
            <p className="text-sm text-gray-500">
              {hasPortfolio1 && hasPortfolio2
                ? 'Both portfolios loaded (data persisted)'
                : hasPortfolio1 || hasPortfolio2
                ? 'One portfolio loaded (data persisted)'
                : 'Upload Excel files to load portfolio data'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyData && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClearData()
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Clear all data"
              title="Clear all data"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          {/* Upload Section */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <FileUpload
              portfolioId="portfolio1"
              portfolioName="Jiten's Portfolio"
              onUpload={onUpload}
              isLoading={isLoading}
              hasData={hasPortfolio1}
            />
            <FileUpload
              portfolioId="portfolio2"
              portfolioName="Khushboo's Portfolio"
              onUpload={onUpload}
              isLoading={isLoading}
              hasData={hasPortfolio2}
            />
          </div>

          {/* Divider */}
          <div className="my-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUseMockData}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Database className="h-4 w-4" />
              Use Sample Data
            </button>
            
            {hasAnyData && (
              <button
                onClick={handleClearData}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-gray-400">
            Expected Excel format: Trades sheet with columns - Date, Time, Name, Ticker, Activity (Buy/Sell), Order Type, Quantity, Price Per Share, Cash Amount, Commission Charges
          </p>
          
          <p className="mt-2 text-center text-xs text-emerald-600">
            ✓ Data is automatically saved and will persist across page refreshes
          </p>
        </div>
      )}
    </div>
  )
}

export default DataSourceSelector
