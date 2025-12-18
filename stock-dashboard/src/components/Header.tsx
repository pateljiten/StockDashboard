'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, ArrowLeft, DollarSign } from 'lucide-react'

type HeaderProps = {
  lastUpdated?: string
  onRefresh?: () => Promise<void> | void
  showBackButton?: boolean
  isLoading?: boolean
  priceProgress?: { fetched: number; total: number } | null
}

const Header = ({ 
  lastUpdated, 
  onRefresh, 
  showBackButton = false, 
  isLoading = false,
  priceProgress = null,
}: HeaderProps) => {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshClick = async () => {
    if (isRefreshing || isLoading) return
    
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      await handleRefreshClick()
    }
  }

  const handleBackClick = () => {
    router.push('/')
  }

  const handleBackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleBackClick()
    }
  }

  const showSpinner = isRefreshing || isLoading

  // Get progress text
  const getProgressText = () => {
    if (priceProgress) {
      return `Fetching prices... ${priceProgress.fetched}/${priceProgress.total}`
    }
    if (showSpinner) {
      return 'Loading...'
    }
    return 'Refresh Prices'
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              onKeyDown={handleBackKeyDown}
              className="mr-2 flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Go back to home"
              tabIndex={0}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              US Stocks Portfolio
            </h1>
            <p className="text-xs text-gray-500">Investment Tracker</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Price Progress */}
          {priceProgress && (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(priceProgress.fetched / priceProgress.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {priceProgress.fetched}/{priceProgress.total}
              </span>
            </div>
          )}
          
          {lastUpdated && !priceProgress ? (
            <span className="hidden text-sm text-gray-500 sm:inline">
              Last updated: {lastUpdated}
            </span>
          ) : !priceProgress ? (
            <span className="hidden h-5 w-32 animate-pulse rounded bg-gray-200 sm:inline-block" />
          ) : null}
          
          <button
            onClick={handleRefreshClick}
            onKeyDown={handleRefreshKeyDown}
            disabled={showSpinner}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh prices"
            tabIndex={0}
          >
            <RefreshCw className={`h-4 w-4 ${showSpinner ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {getProgressText()}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
