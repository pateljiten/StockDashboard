import { Portfolio, StockHolding, Transaction, CashPosition, PortfolioSummary } from '@/types/portfolio'

// Portfolio 1 Holdings
const portfolio1Holdings: StockHolding[] = [
  {
    ticker: 'META',
    name: 'Meta Platforms Inc',
    qty: 100.45,
    avgBuyPrice: 608.21,
    ltp: 647.51,
    buyValue: 61134.80,
    presentValue: 65045.33,
    pnlPercent: 6.46,
    allocationPercent: 9.24,
    priceChangePercent: 0.59,
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc',
    qty: 200.52,
    avgBuyPrice: 206.56,
    ltp: 222.54,
    buyValue: 41419.40,
    presentValue: 44635.75,
    pnlPercent: 7.74,
    allocationPercent: 6.47,
    priceChangePercent: -1.61,
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc Class A',
    qty: 100.93,
    avgBuyPrice: 154.64,
    ltp: 308.22,
    buyValue: 15608.71,
    presentValue: 31108.68,
    pnlPercent: 99.31,
    allocationPercent: 4.82,
    priceChangePercent: -0.35,
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices Inc',
    qty: 150.69,
    avgBuyPrice: 123.83,
    ltp: 207.58,
    buyValue: 18659.93,
    presentValue: 31276.23,
    pnlPercent: 67.63,
    allocationPercent: 4.72,
    priceChangePercent: -1.52,
  },
  {
    ticker: 'BTCUSD',
    name: 'Bitcoin',
    qty: 0.33,
    avgBuyPrice: 90831.20,
    ltp: 85743.63,
    buyValue: 29974.30,
    presentValue: 28295.40,
    pnlPercent: -5.60,
    allocationPercent: 4.54,
    priceChangePercent: -0.80,
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    qty: 60.37,
    avgBuyPrice: 428.69,
    ltp: 474.82,
    buyValue: 25884.15,
    presentValue: 28664.65,
    pnlPercent: 10.76,
    allocationPercent: 4.25,
    priceChangePercent: -0.78,
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    qty: 140.99,
    avgBuyPrice: 122.55,
    ltp: 176.29,
    buyValue: 17278.32,
    presentValue: 24854.70,
    pnlPercent: 43.85,
    allocationPercent: 3.72,
    priceChangePercent: 0.73,
  },
]

// Portfolio 2 Holdings
const portfolio2Holdings: StockHolding[] = [
  {
    ticker: 'META',
    name: 'Meta Platforms Inc',
    qty: 80.00,
    avgBuyPrice: 608.21,
    ltp: 647.51,
    buyValue: 48656.80,
    presentValue: 51800.80,
    pnlPercent: 6.46,
    allocationPercent: 9.24,
    priceChangePercent: 0.59,
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc',
    qty: 167.00,
    avgBuyPrice: 206.56,
    ltp: 222.54,
    buyValue: 34495.52,
    presentValue: 37164.18,
    pnlPercent: 7.74,
    allocationPercent: 6.47,
    priceChangePercent: -1.61,
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc Class A',
    qty: 97.00,
    avgBuyPrice: 154.64,
    ltp: 308.22,
    buyValue: 15000.08,
    presentValue: 29897.34,
    pnlPercent: 99.31,
    allocationPercent: 4.82,
    priceChangePercent: -0.35,
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices Inc',
    qty: 137.00,
    avgBuyPrice: 123.83,
    ltp: 207.58,
    buyValue: 16964.71,
    presentValue: 28438.46,
    pnlPercent: 67.63,
    allocationPercent: 4.72,
    priceChangePercent: -1.52,
  },
  {
    ticker: 'BTCUSD',
    name: 'Bitcoin',
    qty: 0.33,
    avgBuyPrice: 90831.20,
    ltp: 85743.63,
    buyValue: 29974.30,
    presentValue: 28295.40,
    pnlPercent: -5.60,
    allocationPercent: 4.54,
    priceChangePercent: -0.80,
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    qty: 53.00,
    avgBuyPrice: 428.69,
    ltp: 474.82,
    buyValue: 22720.57,
    presentValue: 25165.46,
    pnlPercent: 10.76,
    allocationPercent: 4.25,
    priceChangePercent: -0.78,
  },
  {
    ticker: 'SOXX',
    name: 'iShares Semiconductor ETF',
    qty: 159.04,
    avgBuyPrice: 214.32,
    ltp: 298.01,
    buyValue: 34086.63,
    presentValue: 47395.79,
    pnlPercent: 39.05,
    allocationPercent: 3.74,
    priceChangePercent: -0.49,
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    qty: 126.00,
    avgBuyPrice: 122.55,
    ltp: 176.29,
    buyValue: 15441.30,
    presentValue: 22212.54,
    pnlPercent: 43.85,
    allocationPercent: 3.72,
    priceChangePercent: 0.73,
  },
  {
    ticker: 'TMO',
    name: 'Thermo Fisher Scientific Inc',
    qty: 80.38,
    avgBuyPrice: 415.49,
    ltp: 575.91,
    buyValue: 33399.00,
    presentValue: 46293.69,
    pnlPercent: 38.61,
    allocationPercent: 3.66,
    priceChangePercent: 0.71,
  },
  {
    ticker: 'MELI',
    name: 'MercadoLibre Inc',
    qty: 22.75,
    avgBuyPrice: 2217.11,
    ltp: 1966.76,
    buyValue: 50450.27,
    presentValue: 44753.40,
    pnlPercent: -11.29,
    allocationPercent: 3.54,
    priceChangePercent: -2.44,
  },
  {
    ticker: 'LLY',
    name: 'Eli Lilly And Co',
    qty: 39.69,
    avgBuyPrice: 736.64,
    ltp: 1062.19,
    buyValue: 29239.90,
    presentValue: 42162.03,
    pnlPercent: 44.19,
    allocationPercent: 3.33,
    priceChangePercent: 3.38,
  },
  {
    ticker: 'NVO',
    name: 'Novo Nordisk A/S',
    qty: 766.02,
    avgBuyPrice: 66.41,
    ltp: 50.37,
    buyValue: 50873.00,
    presentValue: 38584.52,
    pnlPercent: -24.15,
    allocationPercent: 3.05,
    priceChangePercent: 0.38,
  },
]

// Portfolio 1 Transactions
const portfolio1Transactions: Transaction[] = [
  {
    id: '1',
    ticker: 'IREN',
    name: 'IREN Ltd',
    type: 'BUY',
    shares: 25,
    price: 40.67,
    date: '12/12/2025',
    allocationChange: 0.91,
  },
  {
    id: '2',
    ticker: 'UBER',
    name: 'Uber Technologies Inc',
    type: 'BUY',
    shares: 62.5,
    price: 83.03,
    date: '10/12/2025',
    allocationChange: 2.57,
  },
  {
    id: '3',
    ticker: 'SNOW',
    name: 'Snowflake Inc',
    type: 'BUY',
    shares: 10,
    price: 221.39,
    date: '09/12/2025',
    allocationChange: 0.41,
  },
]

// Portfolio 2 Transactions
const portfolio2Transactions: Transaction[] = [
  {
    id: '4',
    ticker: 'TSLA',
    name: 'Tesla Inc',
    type: 'BUY',
    shares: 15,
    price: 425.50,
    date: '11/12/2025',
    allocationChange: 1.25,
  },
  {
    id: '5',
    ticker: 'AAPL',
    name: 'Apple Inc',
    type: 'SELL',
    shares: 20,
    price: 195.75,
    date: '08/12/2025',
    allocationChange: -0.85,
  },
]

// Portfolio 1 Summary
const portfolio1Summary: PortfolioSummary = {
  invested: 565282.66,
  current: 632010.37,
  realisedPnL: 83575.94,
  realisedPnLPercent: 16.72,
  unrealisedPnL: 66727.71,
  unrealisedPnLPercent: 13.35,
  netPnL: 158027.50,
  netPnLPercent: 31.61,
}

// Portfolio 2 Summary
const portfolio2Summary: PortfolioSummary = {
  invested: 565282.65,
  current: 632010.36,
  realisedPnL: 83575.94,
  realisedPnLPercent: 16.72,
  unrealisedPnL: 66727.71,
  unrealisedPnLPercent: 13.35,
  netPnL: 158027.50,
  netPnLPercent: 31.61,
}

// Portfolio 1 Cash Position
const portfolio1CashPosition: CashPosition = {
  cashPosition: 5000,
}

// Portfolio 2 Cash Position
const portfolio2CashPosition: CashPosition = {
  cashPosition: 3000,
}

// Create portfolios
export const portfolio1: Portfolio = {
  id: 'portfolio1',
  name: 'Jiten\'s Portfolio',
  summary: portfolio1Summary,
  cashPosition: portfolio1CashPosition,
  holdings: portfolio1Holdings,
  transactions: portfolio1Transactions,
}

export const portfolio2: Portfolio = {
  id: 'portfolio2',
  name: 'Khushboo\'s Portfolio',
  summary: portfolio2Summary,
  cashPosition: portfolio2CashPosition,
  holdings: portfolio2Holdings,
  transactions: portfolio2Transactions,
}

// Consolidated Portfolio
export const getConsolidatedPortfolio = (): Portfolio => {
  // Merge holdings from both portfolios
  const holdingsMap = new Map<string, StockHolding>()
  
  const mergeHoldings = (holdings: StockHolding[]) => {
    holdings.forEach(holding => {
      if (holdingsMap.has(holding.ticker)) {
        const existing = holdingsMap.get(holding.ticker)!
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
  
  mergeHoldings(portfolio1Holdings)
  mergeHoldings(portfolio2Holdings)
  
  const consolidatedHoldings = Array.from(holdingsMap.values())
  const totalValue = consolidatedHoldings.reduce((sum, h) => sum + h.presentValue, 0)
  
  // Recalculate allocation percentages
  consolidatedHoldings.forEach(holding => {
    holding.allocationPercent = (holding.presentValue / totalValue) * 100
  })
  
  // Sort by allocation percentage descending
  consolidatedHoldings.sort((a, b) => b.allocationPercent - a.allocationPercent)
  
  // Merge transactions
  const consolidatedTransactions = [...portfolio1Transactions, ...portfolio2Transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Consolidated summary
  const consolidatedSummary: PortfolioSummary = {
    invested: portfolio1Summary.invested + portfolio2Summary.invested,
    current: portfolio1Summary.current + portfolio2Summary.current,
    realisedPnL: portfolio1Summary.realisedPnL + portfolio2Summary.realisedPnL,
    realisedPnLPercent: 16.72,
    unrealisedPnL: portfolio1Summary.unrealisedPnL + portfolio2Summary.unrealisedPnL,
    unrealisedPnLPercent: 13.35,
    netPnL: portfolio1Summary.netPnL + portfolio2Summary.netPnL,
    netPnLPercent: 31.61,
  }
  
  // Consolidated cash position - sum of both portfolios
  const consolidatedCashPosition: CashPosition = {
    cashPosition: portfolio1CashPosition.cashPosition + portfolio2CashPosition.cashPosition,
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

export const portfolios = {
  portfolio1,
  portfolio2,
  consolidated: getConsolidatedPortfolio(),
}

