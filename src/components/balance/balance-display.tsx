import React from 'react'
import { useBalance } from '@/contexts/balance-context'

export const BalanceDisplay = () => {
  const { balance, isLoading, error } = useBalance()

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Failed to load balance</p>
      </div>
    )
  }

  if (!balance) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900">Current Balance</h2>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-gray-900">
          ${balance.currentBalance.toFixed(2)}
        </span>
        <span className="ml-2 text-sm text-gray-500">USD</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Last updated: {balance.lastUpdated.toLocaleString()}
      </p>
    </div>
  )
}
