export interface BalanceTransaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  timestamp: Date
  apiKeyId?: string
}

export interface Balance {
  currentBalance: number
  transactions: BalanceTransaction[]
  lastUpdated: Date
}

export interface BalanceContextType {
  balance: Balance | null
  isLoading: boolean
  error: Error | null
  refreshBalance: () => Promise<void>
  addTransaction: (transaction: Omit<BalanceTransaction, 'id' | 'timestamp'>) => Promise<void>
}
