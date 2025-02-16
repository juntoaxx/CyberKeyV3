import React from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ApiKeyList } from '@/components/api-keys/api-key-list'
import { CreateApiKeyForm } from '@/components/api-keys/create-api-key-form'
import { BalanceDisplay } from '@/components/balance/balance-display'
import { TransactionHistory } from '@/components/balance/transaction-history'

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor your API usage and manage your keys
            </p>
          </div>
          <div>
            <BalanceDisplay />
          </div>
        </div>

        {/* API Key Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your API keys and their permissions
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <CreateApiKeyForm />
              </div>
            </div>
            <div className="mt-6">
              <ApiKeyList />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory />
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
