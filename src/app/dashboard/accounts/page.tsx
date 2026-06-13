"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountsPage() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 })
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    fetchAccounts().finally(() => setIsPageLoading(false))
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts/summary')
      const data = await res.json()
      if (data.summary) setSummary(data.summary)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground text-sm">Financial overview and expense tracking.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium">
            Log Expense
          </button>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
            Record Income
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isPageLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-9 w-32 mt-1" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Income</h3>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-500">${summary.income.toLocaleString()}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Expenses</h3>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">${summary.expense.toLocaleString()}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Net Profit</h3>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className={`text-3xl font-bold ${summary.profit >= 0 ? 'text-primary' : 'text-red-500'}`}>
                ${summary.profit.toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Placeholder for transactions table */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px] flex items-center justify-center text-muted-foreground">
        Transactions Table Area
      </div>
    </div>
  )
}
