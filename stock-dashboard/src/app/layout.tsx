import type { Metadata } from 'next'
import './globals.css'
import { PortfolioProvider } from '@/context/PortfolioContext'

export const metadata: Metadata = {
  title: 'Stock Investment Dashboard',
  description: 'Track your US stock investments with detailed portfolio analysis',
}

type RootLayoutProps = {
  children: React.ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </body>
    </html>
  )
}

export default RootLayout

