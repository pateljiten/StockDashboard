'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Portfolio, PortfolioView, StockHolding } from '@/types/portfolio'
import { mergePortfolios } from '@/utils/excelParser'
import { fetchClientPrices, PriceInfo } from '@/utils/clientPriceFetcher'

// Storage keys
const STORAGE_KEYS = {
  PORTFOLIO1: 'stock-dashboard-portfolio1',
  PORTFOLIO2: 'stock-dashboard-portfolio2',
} as const

type HoldingUpdate = {
  ticker: string
  ltp?: number
  qty?: number
  buyValue?: number
}

type PortfolioContextType = {
  portfolio1: Portfolio | null
  portfolio2: Portfolio | null
  consolidated: Portfolio | null
  currentView: PortfolioView
  isLoading: boolean
  priceProgress: { fetched: number; total: number } | null
  error: string | null
  setCurrentView: (view: PortfolioView) => void
  uploadPortfolio: (file: File, portfolioId: 'portfolio1' | 'portfolio2', portfolioName: string) => Promise<void>
  getCurrentPortfolio: () => Portfolio | null
  useMockData: () => void
  clearPortfolios: () => void
  refreshPrices: () => Promise<void>
  updateHolding: (portfolioId: 'portfolio1' | 'portfolio2' | 'consolidated', update: HoldingUpdate) => void
  updateCashPosition: (portfolioId: 'portfolio1' | 'portfolio2', amount: number) => void
  deleteHolding: (portfolioId: 'portfolio1' | 'portfolio2' | 'consolidated', ticker: string) => void
  addHolding: (portfolioId: 'portfolio1' | 'portfolio2', holding: NewHolding) => void
}

type NewHolding = {
  ticker: string
  name: string
  qty: number
  avgBuyPrice: number
  ltp: number
}

const PortfolioContext = createContext<PortfolioContextType | null>(null)

export const usePortfolio = () => {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}

type PortfolioProviderProps = {
  children: ReactNode
}

/**
 * Save portfolio to localStorage
 */
const saveToStorage = (key: string, portfolio: Portfolio | null) => {
  if (typeof window === 'undefined') return
  
  try {
    if (portfolio) {
      localStorage.setItem(key, JSON.stringify(portfolio))
    } else {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Load portfolio from localStorage
 */
const loadFromStorage = (key: string): Portfolio | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data) as Portfolio
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  return null
}

/**
 * Update holdings with new price data
 */
const updateHoldingsWithPrices = (
  holdings: StockHolding[],
  prices: Map<string, PriceInfo>
): StockHolding[] => {
  let totalPortfolioValue = 0
  
  // First pass: calculate new present values
  const updatedHoldings = holdings.map(holding => {
    const priceInfo = prices.get(holding.ticker)
    const hasPriceFetched = !!priceInfo?.price
    const ltp = priceInfo?.price || holding.ltp
    const presentValue = holding.qty * ltp
    totalPortfolioValue += presentValue
    
    return {
      ...holding,
      ltp,
      presentValue,
      priceChangePercent: priceInfo?.changePercent ?? holding.priceChangePercent,
      hasPriceFetched,
    }
  })
  
  // Second pass: recalculate P&L and allocation
  return updatedHoldings.map(holding => ({
    ...holding,
    pnlPercent: holding.buyValue > 0 
      ? ((holding.presentValue - holding.buyValue) / holding.buyValue) * 100 
      : 0,
    allocationPercent: totalPortfolioValue > 0 
      ? (holding.presentValue / totalPortfolioValue) * 100 
      : 0,
  }))
}

/**
 * Update portfolio with new price data
 */
const updatePortfolioWithPrices = (
  portfolio: Portfolio,
  prices: Map<string, PriceInfo>
): Portfolio => {
  const updatedHoldings = updateHoldingsWithPrices(portfolio.holdings, prices)
  
  const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.buyValue, 0)
  const totalCurrent = updatedHoldings.reduce((sum, h) => sum + h.presentValue, 0)
  const unrealisedPnL = totalCurrent - totalInvested
  const netPnL = portfolio.summary.realisedPnL + unrealisedPnL
  
  return {
    ...portfolio,
    holdings: updatedHoldings,
    summary: {
      ...portfolio.summary,
      current: totalCurrent,
      unrealisedPnL,
      unrealisedPnLPercent: totalInvested > 0 ? (unrealisedPnL / totalInvested) * 100 : 0,
      netPnL,
      netPnLPercent: totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0,
    },
  }
}

export const PortfolioProvider = ({ children }: PortfolioProviderProps) => {
  const [portfolio1, setPortfolio1] = useState<Portfolio | null>(null)
  const [portfolio2, setPortfolio2] = useState<Portfolio | null>(null)
  const [consolidated, setConsolidated] = useState<Portfolio | null>(null)
  const [currentView, setCurrentView] = useState<PortfolioView>('consolidated')
  const [isLoading, setIsLoading] = useState(true)
  const [priceProgress, setPriceProgress] = useState<{ fetched: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved portfolios from localStorage on mount
  useEffect(() => {
    const loadSavedData = () => {
      const savedP1 = loadFromStorage(STORAGE_KEYS.PORTFOLIO1)
      const savedP2 = loadFromStorage(STORAGE_KEYS.PORTFOLIO2)
      
      if (savedP1) {
        setPortfolio1(savedP1)
      }
      if (savedP2) {
        setPortfolio2(savedP2)
      }
      
      // Set consolidated
      if (savedP1 && savedP2) {
        setConsolidated(mergePortfolios(savedP1, savedP2))
      } else if (savedP1) {
        setConsolidated({ ...savedP1, id: 'consolidated', name: 'Consolidated Portfolio' })
      } else if (savedP2) {
        setConsolidated({ ...savedP2, id: 'consolidated', name: 'Consolidated Portfolio' })
      }
      
      setIsLoading(false)
      setIsInitialized(true)
    }
    
    loadSavedData()
  }, [])

  const updateConsolidated = useCallback((p1: Portfolio | null, p2: Portfolio | null) => {
    if (p1 && p2) {
      setConsolidated(mergePortfolios(p1, p2))
    } else if (p1) {
      setConsolidated({ ...p1, id: 'consolidated', name: 'Consolidated Portfolio' })
    } else if (p2) {
      setConsolidated({ ...p2, id: 'consolidated', name: 'Consolidated Portfolio' })
    } else {
      setConsolidated(null)
    }
  }, [])

  /**
   * Fetch prices from client-side and update portfolio
   */
  const fetchAndUpdatePrices = useCallback(async (portfolio: Portfolio): Promise<Portfolio> => {
    const tickers = portfolio.holdings.map(h => h.ticker)
    
    if (tickers.length === 0) {
      return portfolio
    }
    
    setPriceProgress({ fetched: 0, total: tickers.length })
    
    const prices = await fetchClientPrices(tickers, (fetched, total) => {
      setPriceProgress({ fetched, total })
    })
    
    setPriceProgress(null)
    
    if (prices.size > 0) {
      return updatePortfolioWithPrices(portfolio, prices)
    }
    
    return portfolio
  }, [])

  const uploadPortfolio = useCallback(async (
    file: File,
    portfolioId: 'portfolio1' | 'portfolio2',
    portfolioName: string
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('portfolioId', portfolioId)
      formData.append('portfolioName', portfolioName)
      
      // Upload and parse Excel (server-side)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file')
      }
      
      let newPortfolio = data.portfolio as Portfolio
      console.log('Portfolio parsed:', newPortfolio.holdings.length, 'holdings')
      
      // Try to fetch prices from client-side (browser)
      // But don't fail if price fetching doesn't work
      try {
        console.log('Fetching real-time prices from client...')
        newPortfolio = await fetchAndUpdatePrices(newPortfolio)
      } catch (priceError) {
        console.warn('Price fetching failed, using buy prices as LTP:', priceError)
        // Continue with the portfolio data even without real-time prices
      }
      
      // Save the portfolio regardless of price fetching success
      if (portfolioId === 'portfolio1') {
        setPortfolio1(newPortfolio)
        saveToStorage(STORAGE_KEYS.PORTFOLIO1, newPortfolio)
        updateConsolidated(newPortfolio, portfolio2)
      } else {
        setPortfolio2(newPortfolio)
        saveToStorage(STORAGE_KEYS.PORTFOLIO2, newPortfolio)
        updateConsolidated(portfolio1, newPortfolio)
      }
      
      console.log('Portfolio saved successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('Upload error:', err)
      throw err
    } finally {
      setIsLoading(false)
      setPriceProgress(null)
    }
  }, [portfolio1, portfolio2, updateConsolidated, fetchAndUpdatePrices])

  const refreshPrices = useCallback(async () => {
    if (!portfolio1 && !portfolio2) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Collect all unique tickers from both portfolios
      const allTickers = new Set<string>()
      portfolio1?.holdings.forEach(h => allTickers.add(h.ticker))
      portfolio2?.holdings.forEach(h => allTickers.add(h.ticker))
      
      if (allTickers.size === 0) {
        return
      }
      
      // Fetch prices from client-side
      setPriceProgress({ fetched: 0, total: allTickers.size })
      
      const prices = await fetchClientPrices(Array.from(allTickers), (fetched, total) => {
        setPriceProgress({ fetched, total })
      })
      
      setPriceProgress(null)
      
      if (prices.size === 0) {
        setError('Could not fetch prices. The price API may be temporarily unavailable.')
        console.warn('No prices fetched')
        return
      }
      
      console.log(`Fetched ${prices.size} prices, updating portfolios...`)
      
      // Update portfolios with new prices
      let updatedP1 = portfolio1
      let updatedP2 = portfolio2
      
      if (portfolio1) {
        updatedP1 = updatePortfolioWithPrices(portfolio1, prices)
        setPortfolio1(updatedP1)
        saveToStorage(STORAGE_KEYS.PORTFOLIO1, updatedP1)
      }
      
      if (portfolio2) {
        updatedP2 = updatePortfolioWithPrices(portfolio2, prices)
        setPortfolio2(updatedP2)
        saveToStorage(STORAGE_KEYS.PORTFOLIO2, updatedP2)
      }
      
      // Update consolidated
      updateConsolidated(updatedP1, updatedP2)
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh prices'
      setError(message)
      console.error('Price refresh error:', err)
    } finally {
      setIsLoading(false)
      setPriceProgress(null)
    }
  }, [portfolio1, portfolio2, updateConsolidated])

  const getCurrentPortfolio = useCallback(() => {
    switch (currentView) {
      case 'portfolio1':
        return portfolio1
      case 'portfolio2':
        return portfolio2
      case 'consolidated':
      default:
        return consolidated
    }
  }, [currentView, portfolio1, portfolio2, consolidated])

  const useMockData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Dynamically import mock data to avoid SSR issues
      const { portfolios: mockPortfolios } = await import('@/data/mockData')
      
      // Start with mock data
      let p1 = { ...mockPortfolios.portfolio1 }
      let p2 = { ...mockPortfolios.portfolio2 }
      
      // Try to fetch real prices for mock data
      try {
        const allTickers = new Set<string>()
        p1.holdings.forEach(h => allTickers.add(h.ticker))
        p2.holdings.forEach(h => allTickers.add(h.ticker))
        
        setPriceProgress({ fetched: 0, total: allTickers.size })
        
        const prices = await fetchClientPrices(Array.from(allTickers), (fetched, total) => {
          setPriceProgress({ fetched, total })
        })
        
        if (prices.size > 0) {
          p1 = updatePortfolioWithPrices(p1, prices)
          p2 = updatePortfolioWithPrices(p2, prices)
          console.log(`Updated mock data with ${prices.size} real prices`)
        }
      } catch (priceError) {
        console.warn('Could not fetch prices for mock data:', priceError)
        // Continue with mock prices
      }
      
      setPortfolio1(p1)
      setPortfolio2(p2)
      setConsolidated(mergePortfolios(p1, p2))
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.PORTFOLIO1, p1)
      saveToStorage(STORAGE_KEYS.PORTFOLIO2, p2)
      
      console.log('Mock data loaded successfully')
    } catch (err) {
      console.error('Error loading mock data:', err)
      setError('Failed to load sample data')
    } finally {
      setIsLoading(false)
      setPriceProgress(null)
    }
  }, [])

  const clearPortfolios = useCallback(() => {
    setPortfolio1(null)
    setPortfolio2(null)
    setConsolidated(null)
    setError(null)
    
    // Clear from storage
    saveToStorage(STORAGE_KEYS.PORTFOLIO1, null)
    saveToStorage(STORAGE_KEYS.PORTFOLIO2, null)
  }, [])

  /**
   * Update a single holding's values (LTP, qty, buyValue) manually
   * This marks the holding as manuallyEdited to remove error styling
   */
  const updateHolding = useCallback((
    portfolioId: 'portfolio1' | 'portfolio2' | 'consolidated',
    update: HoldingUpdate
  ) => {
    const updatePortfolioHolding = (portfolio: Portfolio): Portfolio => {
      // Find and update the holding
      const updatedHoldings = portfolio.holdings.map(holding => {
        if (holding.ticker !== update.ticker) {
          return holding
        }
        
        // Apply updates
        const newLtp = update.ltp ?? holding.ltp
        const newQty = update.qty ?? holding.qty
        const newBuyValue = update.buyValue ?? holding.buyValue
        const newAvgBuyPrice = newQty > 0 ? newBuyValue / newQty : holding.avgBuyPrice
        const newPresentValue = newQty * newLtp
        const newPnlPercent = newBuyValue > 0 
          ? ((newPresentValue - newBuyValue) / newBuyValue) * 100 
          : 0
        
        return {
          ...holding,
          ltp: newLtp,
          qty: newQty,
          buyValue: newBuyValue,
          avgBuyPrice: newAvgBuyPrice,
          presentValue: newPresentValue,
          pnlPercent: newPnlPercent,
          manuallyEdited: true,
          hasPriceFetched: true, // Mark as fetched since user has corrected it
        }
      })
      
      // Recalculate total portfolio value for allocation percentages
      const totalPortfolioValue = updatedHoldings.reduce((sum, h) => sum + h.presentValue, 0)
      
      // Update allocation percentages
      const holdingsWithAllocation = updatedHoldings.map(holding => ({
        ...holding,
        allocationPercent: totalPortfolioValue > 0 
          ? (holding.presentValue / totalPortfolioValue) * 100 
          : 0,
      }))
      
      // Recalculate summary
      const totalInvested = holdingsWithAllocation.reduce((sum, h) => sum + h.buyValue, 0)
      const totalCurrent = holdingsWithAllocation.reduce((sum, h) => sum + h.presentValue, 0)
      const unrealisedPnL = totalCurrent - totalInvested
      const netPnL = portfolio.summary.realisedPnL + unrealisedPnL
      
      return {
        ...portfolio,
        holdings: holdingsWithAllocation,
        summary: {
          ...portfolio.summary,
          invested: totalInvested,
          current: totalCurrent,
          unrealisedPnL,
          unrealisedPnLPercent: totalInvested > 0 ? (unrealisedPnL / totalInvested) * 100 : 0,
          netPnL,
          netPnLPercent: totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0,
        },
      }
    }
    
    // For consolidated view, we need to update both portfolios if the ticker exists in them
    if (portfolioId === 'consolidated') {
      let updatedP1 = portfolio1
      let updatedP2 = portfolio2
      
      // Check if ticker exists in portfolio1 and update it
      if (portfolio1?.holdings.some(h => h.ticker === update.ticker)) {
        updatedP1 = updatePortfolioHolding(portfolio1)
        setPortfolio1(updatedP1)
        saveToStorage(STORAGE_KEYS.PORTFOLIO1, updatedP1)
      }
      
      // Check if ticker exists in portfolio2 and update it
      if (portfolio2?.holdings.some(h => h.ticker === update.ticker)) {
        updatedP2 = updatePortfolioHolding(portfolio2)
        setPortfolio2(updatedP2)
        saveToStorage(STORAGE_KEYS.PORTFOLIO2, updatedP2)
      }
      
      // Update consolidated
      updateConsolidated(updatedP1, updatedP2)
    } else if (portfolioId === 'portfolio1' && portfolio1) {
      const updated = updatePortfolioHolding(portfolio1)
      setPortfolio1(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO1, updated)
      updateConsolidated(updated, portfolio2)
    } else if (portfolioId === 'portfolio2' && portfolio2) {
      const updated = updatePortfolioHolding(portfolio2)
      setPortfolio2(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO2, updated)
      updateConsolidated(portfolio1, updated)
    }
  }, [portfolio1, portfolio2, updateConsolidated])

  /**
   * Update cash position for a specific portfolio
   */
  const updateCashPosition = useCallback((
    portfolioId: 'portfolio1' | 'portfolio2',
    amount: number
  ) => {
    if (portfolioId === 'portfolio1' && portfolio1) {
      const updated = {
        ...portfolio1,
        cashPosition: { cashPosition: amount },
      }
      setPortfolio1(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO1, updated)
      updateConsolidated(updated, portfolio2)
    } else if (portfolioId === 'portfolio2' && portfolio2) {
      const updated = {
        ...portfolio2,
        cashPosition: { cashPosition: amount },
      }
      setPortfolio2(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO2, updated)
      updateConsolidated(portfolio1, updated)
    }
  }, [portfolio1, portfolio2, updateConsolidated])

  /**
   * Delete a holding from a portfolio
   */
  const deleteHolding = useCallback((
    portfolioId: 'portfolio1' | 'portfolio2' | 'consolidated',
    ticker: string
  ) => {
    const removeHoldingFromPortfolio = (portfolio: Portfolio): Portfolio => {
      const updatedHoldings = portfolio.holdings.filter(h => h.ticker !== ticker)
      
      // Recalculate total portfolio value for allocation percentages
      const totalPortfolioValue = updatedHoldings.reduce((sum, h) => sum + h.presentValue, 0)
      
      // Update allocation percentages
      const holdingsWithAllocation = updatedHoldings.map(holding => ({
        ...holding,
        allocationPercent: totalPortfolioValue > 0 
          ? (holding.presentValue / totalPortfolioValue) * 100 
          : 0,
      }))
      
      // Recalculate summary
      const totalInvested = holdingsWithAllocation.reduce((sum, h) => sum + h.buyValue, 0)
      const totalCurrent = holdingsWithAllocation.reduce((sum, h) => sum + h.presentValue, 0)
      const unrealisedPnL = totalCurrent - totalInvested
      const netPnL = portfolio.summary.realisedPnL + unrealisedPnL
      
      return {
        ...portfolio,
        holdings: holdingsWithAllocation,
        summary: {
          ...portfolio.summary,
          invested: totalInvested,
          current: totalCurrent,
          unrealisedPnL,
          unrealisedPnLPercent: totalInvested > 0 ? (unrealisedPnL / totalInvested) * 100 : 0,
          netPnL,
          netPnLPercent: totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0,
        },
      }
    }
    
    // For consolidated view, delete from both portfolios if ticker exists
    if (portfolioId === 'consolidated') {
      let updatedP1 = portfolio1
      let updatedP2 = portfolio2
      
      if (portfolio1?.holdings.some(h => h.ticker === ticker)) {
        updatedP1 = removeHoldingFromPortfolio(portfolio1)
        setPortfolio1(updatedP1)
        saveToStorage(STORAGE_KEYS.PORTFOLIO1, updatedP1)
      }
      
      if (portfolio2?.holdings.some(h => h.ticker === ticker)) {
        updatedP2 = removeHoldingFromPortfolio(portfolio2)
        setPortfolio2(updatedP2)
        saveToStorage(STORAGE_KEYS.PORTFOLIO2, updatedP2)
      }
      
      updateConsolidated(updatedP1, updatedP2)
    } else if (portfolioId === 'portfolio1' && portfolio1) {
      const updated = removeHoldingFromPortfolio(portfolio1)
      setPortfolio1(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO1, updated)
      updateConsolidated(updated, portfolio2)
    } else if (portfolioId === 'portfolio2' && portfolio2) {
      const updated = removeHoldingFromPortfolio(portfolio2)
      setPortfolio2(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO2, updated)
      updateConsolidated(portfolio1, updated)
    }
  }, [portfolio1, portfolio2, updateConsolidated])

  /**
   * Add a new holding to a portfolio
   */
  const addHolding = useCallback((
    portfolioId: 'portfolio1' | 'portfolio2',
    newHolding: NewHolding
  ) => {
    const addHoldingToPortfolio = (portfolio: Portfolio): Portfolio => {
      const buyValue = newHolding.qty * newHolding.avgBuyPrice
      const presentValue = newHolding.qty * newHolding.ltp
      const pnlPercent = buyValue > 0 ? ((presentValue - buyValue) / buyValue) * 100 : 0

      const holding: StockHolding = {
        ticker: newHolding.ticker,
        name: newHolding.name,
        qty: newHolding.qty,
        avgBuyPrice: newHolding.avgBuyPrice,
        ltp: newHolding.ltp,
        buyValue,
        presentValue,
        pnlPercent,
        allocationPercent: 0, // Will be recalculated
        priceChangePercent: 0,
        hasPriceFetched: true,
        manuallyEdited: true,
      }

      const updatedHoldings = [...portfolio.holdings, holding]
      
      // Recalculate total portfolio value for allocation percentages
      const totalPortfolioValue = updatedHoldings.reduce((sum, h) => sum + h.presentValue, 0)
      
      // Update allocation percentages
      const holdingsWithAllocation = updatedHoldings.map(h => ({
        ...h,
        allocationPercent: totalPortfolioValue > 0 
          ? (h.presentValue / totalPortfolioValue) * 100 
          : 0,
      }))
      
      // Sort by allocation descending
      holdingsWithAllocation.sort((a, b) => b.allocationPercent - a.allocationPercent)
      
      // Recalculate summary
      const totalInvested = holdingsWithAllocation.reduce((sum, h) => sum + h.buyValue, 0)
      const totalCurrent = holdingsWithAllocation.reduce((sum, h) => sum + h.presentValue, 0)
      const unrealisedPnL = totalCurrent - totalInvested
      const netPnL = portfolio.summary.realisedPnL + unrealisedPnL
      
      return {
        ...portfolio,
        holdings: holdingsWithAllocation,
        summary: {
          ...portfolio.summary,
          invested: totalInvested,
          current: totalCurrent,
          unrealisedPnL,
          unrealisedPnLPercent: totalInvested > 0 ? (unrealisedPnL / totalInvested) * 100 : 0,
          netPnL,
          netPnLPercent: totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0,
        },
      }
    }
    
    if (portfolioId === 'portfolio1' && portfolio1) {
      const updated = addHoldingToPortfolio(portfolio1)
      setPortfolio1(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO1, updated)
      updateConsolidated(updated, portfolio2)
    } else if (portfolioId === 'portfolio2' && portfolio2) {
      const updated = addHoldingToPortfolio(portfolio2)
      setPortfolio2(updated)
      saveToStorage(STORAGE_KEYS.PORTFOLIO2, updated)
      updateConsolidated(portfolio1, updated)
    }
  }, [portfolio1, portfolio2, updateConsolidated])

  // Don't render children until we've loaded from localStorage
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading portfolios...</p>
        </div>
      </div>
    )
  }

  return (
    <PortfolioContext.Provider
      value={{
        portfolio1,
        portfolio2,
        consolidated,
        currentView,
        isLoading,
        priceProgress,
        error,
        setCurrentView,
        uploadPortfolio,
        getCurrentPortfolio,
        useMockData,
        clearPortfolios,
        refreshPrices,
        updateHolding,
        updateCashPosition,
        deleteHolding,
        addHolding,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}
