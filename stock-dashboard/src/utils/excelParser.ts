import * as XLSX from 'xlsx'
import { Portfolio, StockHolding, Transaction, CashPosition, PortfolioSummary } from '@/types/portfolio'

// Raw trade data from Excel
export type TradeRecord = {
  date: string
  time: string
  name: string
  ticker: string
  activity: 'Buy' | 'Sell'
  orderType: string
  quantity: number
  pricePerShare: number
  cashAmount: number
  commissionCharges: number
}

// Intermediate holding calculation
type HoldingAccumulator = {
  ticker: string
  name: string
  totalQty: number
  totalCost: number
  totalSellValue: number
  soldQty: number
  transactions: TradeRecord[]
}

/**
 * Parse Excel file and extract trade data from "Trades" sheet
 */
export const parseExcelFile = (buffer: ArrayBuffer): TradeRecord[] => {
  const workbook = XLSX.read(buffer, { type: 'array' })
  
  // Look for "Trades" sheet (case-insensitive)
  const sheetName = workbook.SheetNames.find(
    name => name.toLowerCase() === 'trades'
  ) || workbook.SheetNames[0]
  
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
  
  // Skip header row and parse data
  const trades: TradeRecord[] = []
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i]
    if (!row || row.length < 10) continue
    
    // Parse date - handle Excel date serial numbers
    let dateStr = ''
    if (typeof row[0] === 'number') {
      const date = XLSX.SSF.parse_date_code(row[0])
      dateStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    } else {
      dateStr = String(row[0] || '')
    }
    
    const trade: TradeRecord = {
      date: dateStr,
      time: String(row[1] || ''),
      name: String(row[2] || ''),
      ticker: String(row[3] || ''),
      activity: String(row[4] || '').toLowerCase() === 'buy' ? 'Buy' : 'Sell',
      orderType: String(row[5] || ''),
      quantity: parseFloat(String(row[6] || '0')) || 0,
      pricePerShare: parseFloat(String(row[7] || '0')) || 0,
      cashAmount: parseFloat(String(row[8] || '0')) || 0,
      commissionCharges: parseFloat(String(row[9] || '0')) || 0,
    }
    
    if (trade.ticker && trade.quantity > 0) {
      trades.push(trade)
    }
  }
  
  return trades
}

/**
 * Calculate holdings from trade records
 */
export const calculateHoldings = (trades: TradeRecord[], currentPrices: Map<string, number>): StockHolding[] => {
  const holdingsMap = new Map<string, HoldingAccumulator>()
  
  // Sort trades by date (oldest first)
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  // Process each trade
  sortedTrades.forEach(trade => {
    const existing = holdingsMap.get(trade.ticker) || {
      ticker: trade.ticker,
      name: trade.name,
      totalQty: 0,
      totalCost: 0,
      totalSellValue: 0,
      soldQty: 0,
      transactions: [],
    }
    
    if (trade.activity === 'Buy') {
      existing.totalQty += trade.quantity
      existing.totalCost += trade.quantity * trade.pricePerShare + trade.commissionCharges
    } else {
      // Sell
      existing.totalQty -= trade.quantity
      existing.soldQty += trade.quantity
      existing.totalSellValue += trade.quantity * trade.pricePerShare - trade.commissionCharges
    }
    
    existing.transactions.push(trade)
    holdingsMap.set(trade.ticker, existing)
  })
  
  // Convert to StockHolding array
  const holdings: StockHolding[] = []
  let totalPortfolioValue = 0
  
  // First pass: calculate present values
  holdingsMap.forEach((acc, ticker) => {
    if (acc.totalQty > 0.0001) { // Only include holdings with positive quantity
      const ltp = currentPrices.get(ticker) || acc.totalCost / acc.totalQty
      const presentValue = acc.totalQty * ltp
      totalPortfolioValue += presentValue
    }
  })
  
  // Second pass: create holdings with allocation percentages
  holdingsMap.forEach((acc, ticker) => {
    if (acc.totalQty > 0.0001) {
      const avgBuyPrice = acc.totalCost / (acc.totalQty + acc.soldQty) // Average cost basis
      const ltp = currentPrices.get(ticker) || avgBuyPrice
      const buyValue = acc.totalQty * avgBuyPrice
      const presentValue = acc.totalQty * ltp
      const pnlPercent = ((presentValue - buyValue) / buyValue) * 100
      
      holdings.push({
        ticker: acc.ticker,
        name: acc.name,
        qty: acc.totalQty,
        avgBuyPrice: avgBuyPrice,
        ltp: ltp,
        buyValue: buyValue,
        presentValue: presentValue,
        pnlPercent: pnlPercent,
        allocationPercent: totalPortfolioValue > 0 ? (presentValue / totalPortfolioValue) * 100 : 0,
        priceChangePercent: 0, // Would need real-time data for this
      })
    }
  })
  
  // Sort by allocation percentage descending
  holdings.sort((a, b) => b.allocationPercent - a.allocationPercent)
  
  return holdings
}

/**
 * Extract recent transactions from trades
 */
export const extractRecentTransactions = (trades: TradeRecord[], limit = 10): Transaction[] => {
  // Sort by date descending (most recent first)
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time)
    const dateB = new Date(b.date + ' ' + b.time)
    return dateB.getTime() - dateA.getTime()
  })
  
  return sortedTrades.slice(0, limit).map((trade, index) => ({
    id: `${trade.ticker}-${trade.date}-${index}`,
    ticker: trade.ticker,
    name: trade.name,
    type: trade.activity === 'Buy' ? 'BUY' : 'SELL',
    shares: trade.quantity,
    price: trade.pricePerShare,
    date: formatDate(trade.date),
    allocationChange: 0, // Would need to calculate based on portfolio state
  }))
}

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  } catch {
    return dateStr
  }
}

/**
 * Calculate portfolio summary from holdings and trades
 */
export const calculateSummary = (
  holdings: StockHolding[],
  trades: TradeRecord[]
): PortfolioSummary => {
  const totalInvested = holdings.reduce((sum, h) => sum + h.buyValue, 0)
  const totalCurrent = holdings.reduce((sum, h) => sum + h.presentValue, 0)
  const unrealisedPnL = totalCurrent - totalInvested
  
  // Calculate realized P&L from sells
  let realisedPnL = 0
  const holdingsMap = new Map<string, { avgCost: number; totalQty: number }>()
  
  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  sortedTrades.forEach(trade => {
    const ticker = trade.ticker
    const existing = holdingsMap.get(ticker) || { avgCost: 0, totalQty: 0 }
    
    if (trade.activity === 'Buy') {
      const newTotalCost = existing.avgCost * existing.totalQty + trade.pricePerShare * trade.quantity
      const newTotalQty = existing.totalQty + trade.quantity
      existing.avgCost = newTotalQty > 0 ? newTotalCost / newTotalQty : 0
      existing.totalQty = newTotalQty
    } else {
      // Sell - calculate realized gain/loss
      const costBasis = existing.avgCost * trade.quantity
      const saleProceeds = trade.pricePerShare * trade.quantity - trade.commissionCharges
      realisedPnL += saleProceeds - costBasis
      existing.totalQty -= trade.quantity
    }
    
    holdingsMap.set(ticker, existing)
  })
  
  const netPnL = realisedPnL + unrealisedPnL
  
  return {
    invested: totalInvested,
    current: totalCurrent,
    realisedPnL: realisedPnL,
    realisedPnLPercent: totalInvested > 0 ? (realisedPnL / totalInvested) * 100 : 0,
    unrealisedPnL: unrealisedPnL,
    unrealisedPnLPercent: totalInvested > 0 ? (unrealisedPnL / totalInvested) * 100 : 0,
    netPnL: netPnL,
    netPnLPercent: totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0,
  }
}

/**
 * Calculate cash position (simplified - just returns initial cash, user can edit)
 */
export const calculateCashPosition = (
  initialCash: number = 0
): CashPosition => {
  return {
    cashPosition: initialCash,
  }
}

/**
 * Process Excel file and return complete Portfolio object
 */
export const processExcelToPortfolio = (
  buffer: ArrayBuffer,
  portfolioId: string,
  portfolioName: string,
  currentPrices: Map<string, number> = new Map(),
  initialCash: number = 0
): Portfolio => {
  const trades = parseExcelFile(buffer)
  const holdings = calculateHoldings(trades, currentPrices)
  const transactions = extractRecentTransactions(trades)
  const summary = calculateSummary(holdings, trades)
  const cashPosition = calculateCashPosition(initialCash)
  
  return {
    id: portfolioId,
    name: portfolioName,
    summary,
    cashPosition,
    holdings,
    transactions,
  }
}

/**
 * Merge two portfolios into a consolidated view
 */
export const mergePortfolios = (portfolio1: Portfolio, portfolio2: Portfolio): Portfolio => {
  // Merge holdings
  const holdingsMap = new Map<string, StockHolding>()
  
  const addHoldings = (holdings: StockHolding[]) => {
    holdings.forEach(holding => {
      const existing = holdingsMap.get(holding.ticker)
      if (existing) {
        const totalQty = existing.qty + holding.qty
        const totalBuyValue = existing.buyValue + holding.buyValue
        const totalPresentValue = existing.presentValue + holding.presentValue
        
        holdingsMap.set(holding.ticker, {
          ...existing,
          qty: totalQty,
          avgBuyPrice: totalBuyValue / totalQty,
          buyValue: totalBuyValue,
          presentValue: totalPresentValue,
          pnlPercent: ((totalPresentValue - totalBuyValue) / totalBuyValue) * 100,
        })
      } else {
        holdingsMap.set(holding.ticker, { ...holding })
      }
    })
  }
  
  addHoldings(portfolio1.holdings)
  addHoldings(portfolio2.holdings)
  
  const consolidatedHoldings = Array.from(holdingsMap.values())
  const totalValue = consolidatedHoldings.reduce((sum, h) => sum + h.presentValue, 0)
  
  // Recalculate allocation percentages
  consolidatedHoldings.forEach(holding => {
    holding.allocationPercent = (holding.presentValue / totalValue) * 100
  })
  
  // Sort by allocation
  consolidatedHoldings.sort((a, b) => b.allocationPercent - a.allocationPercent)
  
  // Merge transactions
  const consolidatedTransactions = [...portfolio1.transactions, ...portfolio2.transactions]
    .sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'))
      const dateB = new Date(b.date.split('/').reverse().join('-'))
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 10)
  
  // Consolidated summary
  const consolidatedSummary: PortfolioSummary = {
    invested: portfolio1.summary.invested + portfolio2.summary.invested,
    current: portfolio1.summary.current + portfolio2.summary.current,
    realisedPnL: portfolio1.summary.realisedPnL + portfolio2.summary.realisedPnL,
    realisedPnLPercent: 0,
    unrealisedPnL: portfolio1.summary.unrealisedPnL + portfolio2.summary.unrealisedPnL,
    unrealisedPnLPercent: 0,
    netPnL: portfolio1.summary.netPnL + portfolio2.summary.netPnL,
    netPnLPercent: 0,
  }
  
  const totalInvested = consolidatedSummary.invested
  if (totalInvested > 0) {
    consolidatedSummary.realisedPnLPercent = (consolidatedSummary.realisedPnL / totalInvested) * 100
    consolidatedSummary.unrealisedPnLPercent = (consolidatedSummary.unrealisedPnL / totalInvested) * 100
    consolidatedSummary.netPnLPercent = (consolidatedSummary.netPnL / totalInvested) * 100
  }
  
  // Consolidated cash position - sum of both portfolios
  const consolidatedCashPosition: CashPosition = {
    cashPosition: portfolio1.cashPosition.cashPosition + portfolio2.cashPosition.cashPosition,
  }
  
  return {
    id: 'consolidated',
    name: 'Consolidated Portfolio',
    summary: consolidatedSummary,
    cashPosition: consolidatedCashPosition,
    holdings: consolidatedHoldings,
    transactions: consolidatedTransactions,
  }
}

