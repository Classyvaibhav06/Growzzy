"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Plus, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountsPage() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 })
  const [transactions, setTransactions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form states
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')

  const fetchData = async () => {
    setIsPageLoading(true)
    try {
      const [sumRes, incRes, expRes, clientRes] = await Promise.all([
        fetch('/api/accounts/summary'),
        fetch('/api/accounts/income'),
        fetch('/api/accounts/expenses'),
        fetch('/api/clients')
      ])
      
      const sumData = await sumRes.json()
      const incData = await incRes.json()
      const expData = await expRes.json()
      const clientData = await clientRes.json()

      if (sumData.success) setSummary(sumData.summary)
      if (clientData.success) setClients(clientData.clients || [])

      let combined: any[] = []
      if (incData.success && incData.incomes) {
        combined = [...combined, ...incData.incomes.map((i: any) => ({ ...i, type: 'INCOME' }))]
      }
      if (expData.success && expData.expenses) {
        combined = [...combined, ...expData.expenses.map((e: any) => ({ ...e, type: 'EXPENSE' }))]
      }
      
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTransactions(combined)

    } catch (e) {
      console.error(e)
    } finally {
      setIsPageLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForms = () => {
    setAmount('')
    setCategory('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setClientId('')
    setErrorMsg('')
    setShowIncomeModal(false)
    setShowExpenseModal(false)
  }

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsActionLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/accounts/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          date: new Date(date).toISOString(),
          description
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
        resetForms()
      } else {
        setErrorMsg(data.error || 'Failed to log expense')
      }
    } catch (err) {
      setErrorMsg('An error occurred')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRecordIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsActionLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/accounts/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          date: new Date(date).toISOString(),
          description,
          clientId: clientId || undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
        resetForms()
      } else {
        setErrorMsg(data.error || 'Failed to record income')
      }
    } catch (err) {
      setErrorMsg('An error occurred')
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground text-sm">Financial overview and expense tracking.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowExpenseModal(true)} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Log Expense
          </button>
          <button onClick={() => setShowIncomeModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Record Income
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

      {/* Transactions Table Area */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold leading-none tracking-tight">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isPageLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'INCOME' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {tx.category}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground">
                      {tx.description || (tx.client ? `Client: ${tx.client.name}` : '-')}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {(showExpenseModal || showIncomeModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-xl shadow-lg animate-in fade-in zoom-in-95 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {showExpenseModal ? 'Log Expense' : 'Record Income'}
              </h3>
              <button onClick={resetForms} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {errorMsg && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-500/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={showExpenseModal ? handleLogExpense : handleRecordIncome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={showExpenseModal ? "e.g. Software, Office Supplies" : "e.g. Consulting, Project Milestone"}
                />
              </div>

              {showIncomeModal && (
                <div>
                  <label className="block text-sm font-medium mb-1">Client (Optional)</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={resetForms}
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary/80 rounded-md"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isActionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
