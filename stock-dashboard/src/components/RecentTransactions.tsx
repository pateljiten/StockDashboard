'use client'

import { Transaction } from '@/types/portfolio'
import { formatCurrency, formatPercent, getValueColorClass } from '@/utils/formatters'

type TransactionCardProps = {
  transaction: Transaction
}

const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const isBuy = transaction.type === 'BUY'
  
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-md">
      {/* Logo/Icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
        {transaction.ticker.substring(0, 4)}
      </div>
      
      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{transaction.ticker}</h4>
          <span className="text-xs text-gray-500">{transaction.date}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          <span className={isBuy ? 'text-emerald-600' : 'text-red-500'}>
            {isBuy ? 'Bought' : 'Sold'}
          </span>
          {' '}
          <span className="font-semibold">{transaction.shares}</span>
          {' '}shares of {transaction.name} ({transaction.ticker}) at an average price of{' '}
          <span className="font-semibold text-emerald-600">
            {formatCurrency(transaction.price)}
          </span>
          {' '}per share. Total Allocation changed to{' '}
          <span className={`font-semibold ${getValueColorClass(transaction.allocationChange)}`}>
            {formatPercent(Math.abs(transaction.allocationChange), false)}
          </span>
        </p>
      </div>
    </div>
  )
}

type RecentTransactionsProps = {
  transactions: Transaction[]
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Recent Buy & Sell</h3>
      <div className="flex flex-col gap-3">
        {transactions.length === 0 ? (
          <p className="py-4 text-center text-gray-500">No recent transactions</p>
        ) : (
          transactions.slice(0, 5).map(transaction => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        )}
      </div>
    </div>
  )
}

export default RecentTransactions

