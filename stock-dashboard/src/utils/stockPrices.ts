/**
 * Fetch real-time stock prices from Yahoo Finance API
 */

type YahooQuoteResult = {
  symbol: string
  regularMarketPrice: number
  regularMarketChangePercent: number
}

type StockPrice = {
  ticker: string
  price: number
  changePercent: number
}

/**
 * Fetch current prices for multiple stock tickers
 * Uses Yahoo Finance API through a proxy
 */
export const fetchStockPrices = async (tickers: string[]): Promise<Map<string, StockPrice>> => {
  const priceMap = new Map<string, StockPrice>()
  
  if (tickers.length === 0) {
    return priceMap
  }

  try {
    // Yahoo Finance API endpoint
    const symbols = tickers.join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch stock prices from Yahoo Finance')
      return priceMap
    }
    
    const data = await response.json()
    const quotes = data?.quoteResponse?.result || []
    
    quotes.forEach((quote: YahooQuoteResult) => {
      if (quote.symbol && quote.regularMarketPrice) {
        priceMap.set(quote.symbol, {
          ticker: quote.symbol,
          price: quote.regularMarketPrice,
          changePercent: quote.regularMarketChangePercent || 0,
        })
      }
    })
  } catch (error) {
    console.error('Error fetching stock prices:', error)
  }
  
  return priceMap
}

/**
 * Alternative: Fetch from Financial Modeling Prep API (free tier)
 * Requires API key but has generous free tier
 */
export const fetchStockPricesFMP = async (
  tickers: string[],
  apiKey: string = 'demo'
): Promise<Map<string, StockPrice>> => {
  const priceMap = new Map<string, StockPrice>()
  
  if (tickers.length === 0) {
    return priceMap
  }

  try {
    const symbols = tickers.join(',')
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      return priceMap
    }
    
    const quotes = await response.json()
    
    if (Array.isArray(quotes)) {
      quotes.forEach((quote: { symbol: string; price: number; changesPercentage: number }) => {
        if (quote.symbol && quote.price) {
          priceMap.set(quote.symbol, {
            ticker: quote.symbol,
            price: quote.price,
            changePercent: quote.changesPercentage || 0,
          })
        }
      })
    }
  } catch (error) {
    console.error('Error fetching stock prices from FMP:', error)
  }
  
  return priceMap
}

/**
 * Batch fetch prices with retry logic
 */
export const fetchPricesWithRetry = async (
  tickers: string[],
  maxRetries: number = 2
): Promise<Map<string, StockPrice>> => {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const prices = await fetchStockPrices(tickers)
      if (prices.size > 0) {
        return prices
      }
    } catch (error) {
      lastError = error as Error
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  
  console.warn('All retry attempts failed:', lastError)
  return new Map()
}

