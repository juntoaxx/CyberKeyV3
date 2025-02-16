import React, { createContext, useContext, useState, useEffect } from 'react'
import { doc, onSnapshot, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './auth-context'
import type { Balance, BalanceTransaction, BalanceContextType } from '@/types/balance'

const BalanceContext = createContext<BalanceContextType | null>(null)

export const useBalance = () => {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider')
  }
  return context
}

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setBalance(null)
      setIsLoading(false)
      return
    }

    const balanceRef = doc(db, 'users', user.uid, 'balance', 'current')
    const unsubscribe = onSnapshot(
      balanceRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setBalance({
            currentBalance: data.currentBalance,
            transactions: data.transactions.map((t: any) => ({
              ...t,
              timestamp: t.timestamp.toDate(),
            })),
            lastUpdated: data.lastUpdated.toDate(),
          })
        } else {
          // Initialize balance document if it doesn't exist
          updateDoc(balanceRef, {
            currentBalance: 0,
            transactions: [],
            lastUpdated: Timestamp.now(),
          })
        }
        setIsLoading(false)
      },
      (err) => {
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const refreshBalance = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const balanceRef = doc(db, 'users', user.uid, 'balance', 'current')
      await updateDoc(balanceRef, {
        lastUpdated: Timestamp.now(),
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh balance'))
    } finally {
      setIsLoading(false)
    }
  }

  const addTransaction = async (
    transaction: Omit<BalanceTransaction, 'id' | 'timestamp'>
  ) => {
    if (!user || !balance) return

    const balanceRef = doc(db, 'users', user.uid, 'balance', 'current')
    const transactionsRef = collection(db, 'users', user.uid, 'transactions')

    try {
      // Add transaction to transactions collection
      const newTransaction = {
        ...transaction,
        timestamp: Timestamp.now(),
      }
      await addDoc(transactionsRef, newTransaction)

      // Update current balance
      const newBalance =
        transaction.type === 'credit'
          ? balance.currentBalance + transaction.amount
          : balance.currentBalance - transaction.amount

      await updateDoc(balanceRef, {
        currentBalance: newBalance,
        lastUpdated: Timestamp.now(),
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add transaction'))
      throw err
    }
  }

  return (
    <BalanceContext.Provider
      value={{ balance, isLoading, error, refreshBalance, addTransaction }}
    >
      {children}
    </BalanceContext.Provider>
  )
}
