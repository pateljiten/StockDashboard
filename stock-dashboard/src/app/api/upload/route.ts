import { NextRequest, NextResponse } from 'next/server'
import { parseExcelFile, extractRecentTransactions, calculateSummary, calculateCashPosition } from '@/utils/excelParser'
import { Portfolio, StockHolding } from '@/types/portfolio'

type PriceInfo = {
  price: number
  changePercent: number
}

/**
 * Clean ticker symbol (remove spaces, special characters)
 */
function cleanTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/[^A-Z0-9.]/g, '')
}

/**
 * Fetch prices from Yahoo Finance using the chart endpoint (usually works without auth)
 */
async function fetchYahooChartPrice(ticker: string): Promise<PriceInfo | null> {
  try {
    // Use the spark endpoint which sometimes works better
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d&includePrePost=false`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    const result = data?.chart?.result?.[0]
    
    if (!result?.meta?.regularMarketPrice) {
      return null
    }
    
    const meta = result.meta
    const currentPrice = meta.regularMarketPrice
    const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice
    const changePercent = previousClose > 0 
      ? ((currentPrice - previousClose) / previousClose) * 100 
      : 0
    
    return {
      price: currentPrice,
      changePercent: changePercent,
    }
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error)
    return null
  }
}

/**
 * Fetch prices for multiple tickers with rate limiting
 */
async function fetchStockPrices(tickers: string[]): Promise<Map<string, PriceInfo>> {
  const priceMap = new Map<string, PriceInfo>()
  
  if (tickers.length === 0) {
    return priceMap
  }
  
  console.log('Fetching prices for tickers:', tickers)
  
  // Fetch prices in parallel with small batches to avoid rate limiting
  const batchSize = 5
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize)
    
    const results = await Promise.all(
      batch.map(async (ticker) => {
        const priceInfo = await fetchYahooChartPrice(ticker)
        return { ticker, priceInfo }
      })
    )
    
    results.forEach(({ ticker, priceInfo }) => {
      if (priceInfo) {
        priceMap.set(ticker, priceInfo)
        console.log(`${ticker}: $${priceInfo.price.toFixed(2)} (${priceInfo.changePercent >= 0 ? '+' : ''}${priceInfo.changePercent.toFixed(2)}%)`)
      } else {
        console.warn(`Could not fetch price for ${ticker}`)
      }
    })
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log(`Successfully fetched ${priceMap.size} out of ${tickers.length} prices`)
  return priceMap
}

/**
 * Calculate holdings with real-time prices
 */
function calculateHoldingsWithPrices(
  trades: ReturnType<typeof parseExcelFile>,
  priceData: Map<string, PriceInfo>
): StockHolding[] {
  // Build holdings map from trades
  const holdingsMap = new Map<string, {
    ticker: string
    name: string
    totalQty: number
    totalCost: number
  }>()
  
  // Sort trades by date (oldest first)
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  // Process each trade
  sortedTrades.forEach(trade => {
    const ticker = cleanTicker(trade.ticker)
    const existing = holdingsMap.get(ticker) || {
      ticker: ticker,
      name: trade.name,
      totalQty: 0,
      totalCost: 0,
    }
    
    if (trade.activity === 'Buy') {
      existing.totalQty += trade.quantity
      existing.totalCost += trade.quantity * trade.pricePerShare + trade.commissionCharges
    } else {
      // Sell - reduce quantity and proportionally reduce cost
      const costPerShare = existing.totalQty > 0 ? existing.totalCost / existing.totalQty : 0
      existing.totalQty -= trade.quantity
      existing.totalCost -= trade.quantity * costPerShare
    }
    
    // Update name if newer trade has it
    if (trade.name) {
      existing.name = trade.name
    }
    
    holdingsMap.set(ticker, existing)
  })
  
  // Convert to StockHolding array with real-time prices
  const holdings: StockHolding[] = []
  let totalPortfolioValue = 0
  
  // First pass: calculate present values with LTP
  holdingsMap.forEach((acc, ticker) => {
    if (acc.totalQty > 0.0001) {
      const priceInfo = priceData.get(ticker)
      const avgBuyPrice = acc.totalCost / acc.totalQty
      const ltp = priceInfo?.price || avgBuyPrice
      const presentValue = acc.totalQty * ltp
      totalPortfolioValue += presentValue
    }
  })
  
  // Second pass: create holdings with allocation percentages
  holdingsMap.forEach((acc, ticker) => {
    if (acc.totalQty > 0.0001) {
      const priceInfo = priceData.get(ticker)
      const avgBuyPrice = acc.totalCost / acc.totalQty
      const ltp = priceInfo?.price || avgBuyPrice
      const buyValue = acc.totalCost
      const presentValue = acc.totalQty * ltp
      const pnlPercent = buyValue > 0 ? ((presentValue - buyValue) / buyValue) * 100 : 0
      const priceChangePercent = priceInfo?.changePercent || 0
      
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
        priceChangePercent: priceChangePercent,
      })
    }
  })
  
  // Sort by allocation percentage descending
  holdings.sort((a, b) => b.allocationPercent - a.allocationPercent)
  
  return holdings
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const portfolioId = formData.get('portfolioId') as string
    const portfolioName = formData.get('portfolioName') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer()
    
    // Parse Excel and process data
    const trades = parseExcelFile(buffer)
    
    if (trades.length === 0) {
      return NextResponse.json(
        { error: 'No valid trade data found in file. Make sure the data is in a "Trades" sheet.' },
        { status: 400 }
      )
    }
    
    // Get unique tickers from trades
    const uniqueTickers = [...new Set(trades.map(t => cleanTicker(t.ticker)))].filter(t => t.length > 0)
    console.log(`Found ${uniqueTickers.length} unique tickers`)
    
    // Fetch real-time prices for all tickers
    const priceData = await fetchStockPrices(uniqueTickers)
    
    // Calculate holdings with real-time LTP
    const holdings = calculateHoldingsWithPrices(trades, priceData)
    const transactions = extractRecentTransactions(trades)
    const summary = calculateSummary(holdings, trades)
    const cashPosition = calculateCashPosition(0) // Initialize with 0, user can edit
    
    const portfolio: Portfolio = {
      id: portfolioId || 'portfolio',
      name: portfolioName || 'My Portfolio',
      summary,
      cashPosition,
      holdings,
      transactions,
    }
    
    return NextResponse.json({
      success: true,
      portfolio,
      tradesCount: trades.length,
      pricesFound: priceData.size,
      tickersTotal: uniqueTickers.length,
    })
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: 'Failed to process file. Please check the format.' },
      { status: 500 }
    )
  }
}
