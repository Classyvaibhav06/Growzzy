"use client"

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, FileText, Download, Trash2 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    number: '',
    amount: '',
    dueDate: ''
  })

  useEffect(() => {
    Promise.all([fetchInvoices(), fetchClients()]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      if (data.invoices) setInvoices(data.invoices)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (data.clients) setClients(data.clients)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        clientId: newInvoice.clientId,
        number: newInvoice.number,
        amount: parseFloat(newInvoice.amount),
        dueDate: new Date(newInvoice.dueDate).toISOString()
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (data.invoice) {
        setIsModalOpen(false)
        setNewInvoice({ clientId: '', number: '', amount: '', dueDate: '' })
        fetchInvoices()
      } else {
        alert(data.error || 'Failed to create invoice')
      }
    } catch (e) {
      alert('An error occurred while creating the invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv))
    
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        fetchInvoices() // revert on error
      }
    } catch (e) {
      fetchInvoices()
    }
  }

  const handleDeleteClick = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${number}? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchInvoices()
      } else {
        alert(data.error || 'Failed to delete invoice')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while deleting the invoice')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-muted text-muted-foreground'
      case 'SENT': return 'bg-blue-500/10 text-blue-500'
      case 'PAID': return 'bg-primary/10 text-primary'
      case 'OVERDUE': return 'bg-destructive/10 text-destructive'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground text-sm">Manage and track client invoices.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Invoice
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Invoice Number</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-5 w-5 rounded-full" /></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 mb-2 opacity-50" />
                      <p>No invoices found.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 text-primary hover:underline text-sm font-medium"
                      >
                        Create your first invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 group">
                    <td className="px-6 py-4 font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4">{invoice.client?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 font-medium">${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-xs font-semibold border-none cursor-pointer focus:ring-0 ${getStatusColor(invoice.status)}`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT</option>
                        <option value="PAID">PAID</option>
                        <option value="OVERDUE">OVERDUE</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/api/invoices/${invoice.id}/download`} download className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleDeleteClick(invoice.id, invoice.number)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-500/10" 
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold tracking-tight">Create New Invoice</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Client <span className="text-destructive">*</span></label>
                <select 
                  required
                  value={newInvoice.clientId}
                  onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Invoice Number <span className="text-destructive">*</span></label>
                  <input 
                    required
                    type="text"
                    placeholder="INV-001"
                    value={newInvoice.number}
                    onChange={(e) => setNewInvoice({...newInvoice, number: e.target.value})}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Amount ($) <span className="text-destructive">*</span></label>
                  <input 
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1000.00"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Due Date <span className="text-destructive">*</span></label>
                <input 
                  required
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newInvoice.clientId || !newInvoice.number || !newInvoice.amount || !newInvoice.dueDate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
