import { NextRequest, NextResponse } from 'next/server'

type PriceInfo = {
  price: number
  changePercent: number
  name?: string
}

/**
 * Clean ticker symbol
 */
function cleanTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/[^A-Z0-9.]/g, '')
}

/**
 * Fetch price from Yahoo Finance chart endpoint
 */
async function fetchYahooChartPrice(ticker: string): Promise<PriceInfo | null> {
  try {
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
      name: meta.shortName || meta.longName,
    }
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tickers = searchParams.get('tickers')
    
    if (!tickers) {
      return NextResponse.json(
        { error: 'No tickers provided' },
        { status: 400 }
      )
    }
    
    const tickerList = tickers
      .split(',')
      .map(t => cleanTicker(t))
      .filter(t => t.length > 0)
    
    if (tickerList.length === 0) {
      return NextResponse.json(
        { error: 'No valid tickers provided' },
        { status: 400 }
      )
    }
    
    console.log('Fetching prices for:', tickerList.length, 'tickers')
    
    // Fetch prices in parallel with batching
    const prices: Record<string, PriceInfo> = {}
    const batchSize = 5
    
    for (let i = 0; i < tickerList.length; i += batchSize) {
      const batch = tickerList.slice(i, i + batchSize)
      
      const results = await Promise.all(
        batch.map(async (ticker) => {
          const priceInfo = await fetchYahooChartPrice(ticker)
          return { ticker, priceInfo }
        })
      )
      
      results.forEach(({ ticker, priceInfo }) => {
        if (priceInfo) {
          prices[ticker] = priceInfo
        }
      })
      
      // Small delay between batches
      if (i + batchSize < tickerList.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`Returning ${Object.keys(prices).length} prices out of ${tickerList.length} requested`)
    
    return NextResponse.json({
      success: true,
      prices,
      found: Object.keys(prices).length,
      requested: tickerList.length,
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
