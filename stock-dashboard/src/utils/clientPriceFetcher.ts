/**
 * Client-side price fetcher using Yahoo Finance via CORS proxy
 */

export type PriceInfo = {
  price: number
  changePercent: number
}

/**
 * Fetch price for a single ticker using allorigins.win CORS proxy
 */
async function fetchTickerPrice(ticker: string): Promise<PriceInfo | null> {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=1d`
    
    // Use allorigins.win as CORS proxy - this returns JSON with contents field
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`
    
    const response = await fetch(proxyUrl)
    
    if (!response.ok) {
      console.warn(`Proxy request failed for ${ticker}: ${response.status}`)
      return null
    }
    
    const proxyData = await response.json()
    
    // allorigins returns { contents: "...", status: {...} }
    if (!proxyData.contents) {
      console.warn(`No contents in proxy response for ${ticker}`)
      return null
    }
    
    // Parse the actual Yahoo Finance response
    let data
    try {
      data = JSON.parse(proxyData.contents)
    } catch {
      console.warn(`Failed to parse Yahoo response for ${ticker}`)
      return null
    }
    
    const result = data?.chart?.result?.[0]
    
    if (!result?.meta?.regularMarketPrice) {
      console.warn(`No price data for ${ticker}`)
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
 * Fetch prices for multiple tickers (client-side)
 */
export async function fetchClientPrices(
  tickers: string[],
  onProgress?: (fetched: number, total: number) => void
): Promise<Map<string, PriceInfo>> {
  const priceMap = new Map<string, PriceInfo>()
  
  if (tickers.length === 0) {
    return priceMap
  }
  
  // Clean tickers
  const cleanedTickers = tickers
    .map(t => t.trim().toUpperCase().replace(/[^A-Z0-9.]/g, ''))
    .filter(t => t.length > 0)
  
  console.log(`Fetching prices for ${cleanedTickers.length} tickers via CORS proxy...`)
  
  // Fetch sequentially to avoid overwhelming the proxy
  let fetched = 0
  
  for (const ticker of cleanedTickers) {
    const priceInfo = await fetchTickerPrice(ticker)
    
    if (priceInfo) {
      priceMap.set(ticker, priceInfo)
      console.log(`✓ ${ticker}: $${priceInfo.price.toFixed(2)} (${priceInfo.changePercent >= 0 ? '+' : ''}${priceInfo.changePercent.toFixed(2)}%)`)
    } else {
      console.warn(`✗ ${ticker}: No price found`)
    }
    
    fetched++
    onProgress?.(fetched, cleanedTickers.length)
    
    // Small delay between requests to be nice to the proxy
    if (fetched < cleanedTickers.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  console.log(`Successfully fetched ${priceMap.size} out of ${cleanedTickers.length} prices`)
  return priceMap
}
