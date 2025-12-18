export type StockHolding = {
  ticker: string
  name: string
  qty: number
  avgBuyPrice: number
  ltp: number
  buyValue: number
  presentValue: number
  pnlPercent: number
  allocationPercent: number
  priceChangePercent: number
  logoUrl?: string
  hasPriceFetched?: boolean // true if LTP was fetched from API, false if using buy price as fallback
  manuallyEdited?: boolean // true if user manually edited this holding's values
}

export type Transaction = {
  id: string
  ticker: string
  name: string
  type: 'BUY' | 'SELL'
  shares: number
  price: number
  date: string
  allocationChange: number
  logoUrl?: string
}

export type CashPosition = {
  cashPosition: number
}

export type PortfolioSummary = {
  invested: number
  current: number
  realisedPnL: number
  realisedPnLPercent: number
  unrealisedPnL: number
  unrealisedPnLPercent: number
  netPnL: number
  netPnLPercent: number
}

export type Portfolio = {
  id: string
  name: string
  summary: PortfolioSummary
  cashPosition: CashPosition
  holdings: StockHolding[]
  transactions: Transaction[]
}

export type PortfolioView = 'consolidated' | 'portfolio1' | 'portfolio2'

