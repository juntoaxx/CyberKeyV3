import React from 'react'
import { useBalance } from '@/contexts/balance-context'
import type { BalanceTransaction } from '@/types/balance'

const TransactionRow: React.FC<{ transaction: BalanceTransaction }> = ({ transaction }) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {transaction.timestamp.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{transaction.description}</div>
        {transaction.apiKeyId && (
          <div className="text-xs text-gray-500">API Key: {transaction.apiKeyId}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div
          className={`text-sm font-medium ${
            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
        </div>
      </td>
    </tr>
  )
}

export const TransactionHistory = () => {
  const { balance, isLoading, error } = useBalance()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'credit' | 'debit'>('all')

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Failed to load transactions</p>
      </div>
    )
  }

  if (!balance) {
    return null
  }

  const filteredTransactions = balance.transactions
    .filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (searchTerm === '') return true
      return (
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.apiKeyId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        
        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search transactions..."
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'credit' | 'debit')}
            >
              <option value="all">All Types</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="mt-6 -mx-4 sm:-mx-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
