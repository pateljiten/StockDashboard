'use client'

import { useRouter } from 'next/navigation'
import { IndianRupee, ArrowLeft, Construction, TrendingUp } from 'lucide-react'

const IndianStocksPage = () => {
  const router = useRouter()

  const handleBackClick = () => {
    router.push('/')
  }

  const handleBackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleBackClick()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              onKeyDown={handleBackKeyDown}
              className="mr-2 flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label="Go back to home"
              tabIndex={0}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Indian Stocks</h1>
              <p className="text-xs text-gray-500">Investment Tracker</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          {/* Icon */}
          <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-orange-100 p-6">
            <IndianRupee className="h-16 w-16 text-orange-600" />
          </div>

          {/* Title */}
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
            Indian Stocks Dashboard
          </h2>

          {/* Coming Soon Badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full bg-orange-100 px-6 py-3">
            <Construction className="h-5 w-5 text-orange-600" />
            <span className="text-lg font-semibold text-orange-700">Coming Soon</span>
          </div>

          {/* Description */}
          <p className="mb-12 max-w-md text-center text-lg text-gray-600">
            We&apos;re working on bringing you a comprehensive dashboard for tracking your NSE & BSE investments. Stay tuned!
          </p>

          {/* Features Preview */}
          <div className="mb-12 grid w-full max-w-2xl gap-4 md:grid-cols-3">
            {[
              { title: 'NSE & BSE', desc: 'Track all Indian exchanges' },
              { title: 'Mutual Funds', desc: 'Monitor your MF investments' },
              { title: 'Tax Reports', desc: 'Easy ITR filing support' },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Back to Home Button */}
          <button
            onClick={handleBackClick}
            onKeyDown={handleBackKeyDown}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            tabIndex={0}
          >
            Return to Home
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

export default IndianStocksPage
