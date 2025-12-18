'use client'

import { useState, useEffect } from 'react'
import { usePortfolio } from '@/context/PortfolioContext'
import Header from '@/components/Header'
import PortfolioSelector from '@/components/PortfolioSelector'
import SummaryCards from '@/components/SummaryCards'
import CashPositionReturns from '@/components/CashPositionReturns'
import AllocationBar from '@/components/AllocationBar'
import AllocationChart from '@/components/AllocationChart'
import RecentTransactions from '@/components/RecentTransactions'
import StockHoldingsTable from '@/components/StockHoldingsTable'
import DataSourceSelector from '@/components/DataSourceSelector'

const getFormattedDate = (): string => {
  return new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const USStocksDashboard = () => {
  const {
    portfolio1,
    portfolio2,
    currentView,
    setCurrentView,
    getCurrentPortfolio,
    uploadPortfolio,
    useMockData,
    clearPortfolios,
    isLoading,
    priceProgress,
    refreshPrices,
    updateHolding,
    updateCashPosition,
    deleteHolding,
    addHolding,
  } = usePortfolio()

  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Set the date only on the client side to avoid hydration mismatch
  useEffect(() => {
    setLastUpdated(getFormattedDate())
  }, [])

  const currentPortfolio = getCurrentPortfolio()

  const handleRefresh = async () => {
    await refreshPrices()
    setLastUpdated(getFormattedDate())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdated={lastUpdated} onRefresh={handleRefresh} showBackButton isLoading={isLoading} priceProgress={priceProgress} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Data Source Selector */}
        <section className="mb-6">
          <DataSourceSelector
            onUpload={uploadPortfolio}
            onUseMockData={useMockData}
            onClearData={clearPortfolios}
            isLoading={isLoading}
            hasPortfolio1={!!portfolio1}
            hasPortfolio2={!!portfolio2}
          />
        </section>

        {currentPortfolio ? (
          <>
            {/* Portfolio Selector */}
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentPortfolio.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Track your US investment performance
                </p>
              </div>
              <PortfolioSelector
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>

            {/* Summary Cards */}
            <section className="mb-6" aria-labelledby="summary-heading">
              <h3 id="summary-heading" className="sr-only">
                Portfolio Summary
              </h3>
              <SummaryCards summary={currentPortfolio.summary} />
            </section>

            {/* Cash Position & Scripts */}
            <section className="mb-6" aria-labelledby="cash-heading">
              <h3 id="cash-heading" className="sr-only">
                Portfolio Overview
              </h3>
              <CashPositionReturns 
                cashPosition={currentPortfolio.cashPosition}
                numberOfScripts={currentPortfolio.holdings.length}
                currentValue={currentPortfolio.summary.current}
                currentView={currentView}
                onUpdateCashPosition={
                  currentView !== 'consolidated' 
                    ? (amount) => updateCashPosition(currentView as 'portfolio1' | 'portfolio2', amount)
                    : undefined
                }
              />
            </section>

            {/* Allocation Bar */}
            <section className="mb-6" aria-labelledby="allocation-bar-heading">
              <h3 id="allocation-bar-heading" className="sr-only">
                Portfolio Allocation Bar
              </h3>
              <AllocationBar holdings={currentPortfolio.holdings} />
            </section>

            {/* Allocation Chart & Recent Transactions */}
            <section className="mb-6 grid gap-6 lg:grid-cols-2" aria-labelledby="charts-heading">
              <h3 id="charts-heading" className="sr-only">
                Allocation and Transactions
              </h3>
              <AllocationChart holdings={currentPortfolio.holdings} />
              <RecentTransactions transactions={currentPortfolio.transactions} />
            </section>

            {/* Stock Holdings Table */}
            <section aria-labelledby="holdings-heading">
              <h3 id="holdings-heading" className="sr-only">
                Stock Holdings
              </h3>
              <StockHoldingsTable 
                holdings={currentPortfolio.holdings} 
                currentView={currentView}
                onUpdateHolding={updateHolding}
                onDeleteHolding={deleteHolding}
                onAddHolding={currentView !== 'consolidated' ? addHolding : undefined}
              />
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Portfolio Data</h3>
            <p className="text-gray-500">
              Upload your Excel files above to view your portfolio
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>Stock Portfolio Dashboard © {new Date().getFullYear()}</p>
          <p className="mt-1">Built with Next.js, TypeScript & TailwindCSS</p>
        </div>
      </footer>
    </div>
  )
}

export default USStocksDashboard
