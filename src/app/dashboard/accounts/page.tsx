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
      <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f7]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Accounts</h2>
          <p className="text-[#6b7280] text-sm mt-1">Financial overview and expense tracking.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowExpenseModal(true)} className="bg-white text-[#111827] border border-[#e5e7eb] hover:bg-[#f4f5f7] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Log Expense
          </button>
          <button onClick={() => setShowIncomeModal(true)} className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Record Income
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {isPageLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-[24px] bg-white p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-9 w-32 mt-1" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-[24px] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-bold text-[#6b7280] uppercase">Total Income</h3>
                <TrendingUp className="h-4 w-4 text-[#0aa06e]" />
              </div>
              <div className="text-3xl font-bold text-[#0aa06e]">${summary.income.toLocaleString()}</div>
            </div>

            <div className="rounded-[24px] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-bold text-[#6b7280] uppercase">Total Expenses</h3>
                <TrendingDown className="h-4 w-4 text-[#f03e3e]" />
              </div>
              <div className="text-3xl font-bold text-[#f03e3e]">${summary.expense.toLocaleString()}</div>
            </div>

            <div className="rounded-[24px] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-bold text-[#6b7280] uppercase">Net Profit</h3>
                <DollarSign className="h-4 w-4 text-[#111827]" />
              </div>
              <div className={`text-3xl font-bold ${summary.profit >= 0 ? 'text-[#111827]' : 'text-[#f03e3e]'}`}>
                ${summary.profit.toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transactions Table Area */}
      <div className="rounded-[24px] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f4f5f7]">
          <h3 className="font-bold text-lg text-[#111827]">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#6b7280] uppercase bg-[#f4f5f7]">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Type</th>
                <th className="px-6 py-4 font-bold tracking-wider">Category</th>
                <th className="px-6 py-4 font-bold tracking-wider">Description</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f5f7]">
              {isPageLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-[#f8f9fc]/50">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280] bg-[#f4f5f7]/30">
                    <p className="font-medium text-[#111827] mb-1">No transactions found.</p>
                    <p>Log expenses or record income to see them here.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#f4f5f7] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[#6b7280] font-medium">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${tx.type === 'INCOME' ? 'bg-[#0aa06e]/10 text-[#0aa06e]' : 'bg-[#f03e3e]/10 text-[#f03e3e]'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#111827]">
                      {tx.category}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-[#6b7280]">
                      {tx.description || (tx.client ? `Client: ${tx.client.name}` : '-')}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.type === 'INCOME' ? 'text-[#0aa06e]' : 'text-[#111827]'}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/20 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl animate-in fade-in zoom-in-95 p-6 border border-[#f4f5f7]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#f4f5f7]">
              <h3 className="text-xl font-bold tracking-tight text-[#111827]">
                {showExpenseModal ? 'Log Expense' : 'Record Income'}
              </h3>
              <button onClick={resetForms} className="text-[#6b7280] hover:text-[#111827] transition-colors p-1">
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
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  placeholder={showExpenseModal ? "e.g. Software, Office Supplies" : "e.g. Consulting, Project Milestone"}
                />
              </div>

              {showIncomeModal && (
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1.5">Client (Optional)</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors min-h-[80px]"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#f4f5f7] mt-6">
                <button
                  type="button"
                  onClick={resetForms}
                  className="bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50"
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
