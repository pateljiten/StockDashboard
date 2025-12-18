'use client'

import { useRouter } from 'next/navigation'
import { TrendingUp, IndianRupee, DollarSign, ArrowRight, BarChart3, PieChart, Wallet } from 'lucide-react'

const LandingPage = () => {
  const router = useRouter()

  const handleUSStocksClick = () => {
    router.push('/us-stocks')
  }

  const handleIndianStocksClick = () => {
    router.push('/indian-stocks')
  }

  const handleUSStocksKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleUSStocksClick()
    }
  }

  const handleIndianStocksKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleIndianStocksClick()
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Portfolio Tracker</h1>
              <p className="text-xs text-gray-500">Investment Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Track Your Investments
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Monitor your portfolio performance across global markets with powerful analytics and real-time insights
          </p>
        </div>

        {/* Feature Icons */}
        <div className="mb-12 flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Analytics</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Allocation</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">P&L Tracking</span>
          </div>
        </div>

        {/* Portfolio Selection Cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* US Stocks Card */}
          <button
            onClick={handleUSStocksClick}
            onKeyDown={handleUSStocksKeyDown}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            tabIndex={0}
            aria-label="View US Stocks Portfolio"
          >
            {/* Icon */}
            <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-emerald-100 p-4">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            
            {/* Content */}
            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">US Stocks</h3>
              <p className="mb-6 text-gray-600">
                Track your American stock investments including NYSE, NASDAQ listings and ETFs
              </p>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-emerald-600 transition-transform duration-300 group-hover:translate-x-2">
                <span className="font-semibold">View Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute right-6 top-6 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active
            </div>
          </button>

          {/* Indian Stocks Card */}
          <button
            onClick={handleIndianStocksClick}
            onKeyDown={handleIndianStocksKeyDown}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            tabIndex={0}
            aria-label="View Indian Stocks Portfolio"
          >
            {/* Icon */}
            <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-orange-100 p-4">
              <IndianRupee className="h-8 w-8 text-orange-600" />
            </div>
            
            {/* Content */}
            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Indian Stocks</h3>
              <p className="mb-6 text-gray-600">
                Track your Indian stock investments including NSE, BSE listings and mutual funds
              </p>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-orange-600 transition-transform duration-300 group-hover:translate-x-2">
                <span className="font-semibold">View Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute right-6 top-6 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Coming Soon
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>Portfolio Tracker © {new Date().getFullYear()}</p>
          <p className="mt-1">Built with Next.js, TypeScript & TailwindCSS</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
