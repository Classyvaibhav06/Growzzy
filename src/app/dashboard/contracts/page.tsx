"use client"

import { useState, useEffect, useRef } from 'react'
import { FileText, Download, Calendar, DollarSign, X, Loader2, Upload, Trash2, Edit } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Modal States
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form State (Shared for convenience)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [projectScope, setProjectScope] = useState('')
  const [price, setPrice] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  
  // Upload specific
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([fetchContracts(), fetchClients()]).finally(() => {
      setIsPageLoading(false)
    })
  }, [])

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts')
      const data = await res.json()
      if (data.contracts) setContracts(data.contracts)
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

  const resetForm = () => {
    setEditingId(null)
    setClientId('')
    setTitle('')
    setProjectScope('')
    setPrice('')
    setStartDate('')
    setEndDate('')
    setStatus('')
    setFile(null)
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedClient = clients.find(c => c.id === clientId)
      
      const res = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientName: selectedClient?.name || 'Unknown',
          title,
          contractText: projectScope,
          price: parseFloat(price),
          startDate,
          endDate,
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setIsGenerateModalOpen(false)
        fetchContracts()
        resetForm()
        
        if (data.contract?.id) {
          window.open(`/api/contracts/${data.contract.id}/pdf`, '_blank')
        }
      } else {
        alert(data.error || 'Failed to generate contract')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while generating the contract')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert("Please select a file to upload")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientId', clientId)
      formData.append('title', title)
      formData.append('value', price)
      if (startDate) formData.append('startDate', startDate)
      if (endDate) formData.append('endDate', endDate)

      const res = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (data.success) {
        setIsUploadModalOpen(false)
        fetchContracts()
        resetForm()
      } else {
        alert(data.error || 'Failed to upload contract')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while uploading the contract')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (contract: any) => {
    setEditingId(contract.id)
    setTitle(contract.title || '')
    setPrice(contract.value ? contract.value.toString() : '')
    setStartDate(contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '')
    setEndDate(contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '')
    setStatus(contract.status || 'DRAFT')
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/contracts/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          value: parseFloat(price),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status,
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setIsEditModalOpen(false)
        fetchContracts()
        resetForm()
      } else {
        alert(data.error || 'Failed to update contract')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while updating the contract')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the contract "${title}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchContracts()
      } else {
        alert(data.error || 'Failed to delete contract')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while deleting the contract')
    }
  }

  const handleDownload = (contractId: string, s3Key: string | null) => {
    if (s3Key) {
      window.open(`/api/contracts/${contractId}/pdf`, '_blank')
    } else {
      alert("This contract doesn't have an S3 file attached.")
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-[#0aa06e]/10 text-[#0aa06e]'
      case 'DRAFT': return 'bg-[#e8730a]/10 text-[#e8730a]'
      case 'EXPIRED': return 'bg-[#f03e3e]/10 text-[#f03e3e]'
      case 'CANCELLED': return 'bg-[#f8f9fc] text-[#6b7184] border border-[#0027501a]'
      default: return 'bg-[#f8f9fc] text-[#6b7184] border border-[#0027501a]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f7]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Contracts</h2>
          <p className="text-[#6b7280] text-sm mt-1">Manage, generate, and track client service agreements.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-white text-[#111827] border border-[#e5e7eb] hover:bg-[#f4f5f7] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95"
          >
            Upload Contract
          </button>
          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95"
          >
            Generate Template
          </button>
        </div>
      </div>

      <div className="rounded-[24px] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#6b7280] bg-[#f4f5f7] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Title & Client</th>
                <th className="px-6 py-4 font-bold">Value</th>
                <th className="px-6 py-4 font-bold">Duration</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f5f7]">
              {isPageLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-[#f4f5f7]/50 transition-colors">
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </td>
                  </tr>
                ))
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280] bg-[#f4f5f7]/30">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 mb-4 text-[#6b7280]/50" />
                      <p className="font-medium text-[#111827] mb-1">No contracts found.</p>
                      <div className="flex gap-4 mt-2">
                        <button 
                          onClick={() => setIsUploadModalOpen(true)}
                          className="text-[#2563eb] font-bold hover:underline"
                        >
                          Upload one
                        </button>
                        <span>or</span>
                        <button 
                          onClick={() => setIsGenerateModalOpen(true)}
                          className="text-[#2563eb] font-bold hover:underline"
                        >
                          Generate template
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                contracts.map(contract => (
                  <tr key={contract.id} className="hover:bg-[#f4f5f7] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111827]">{contract.title}</div>
                      <div className="text-[#6b7280] text-xs mt-0.5 font-medium">{contract.client?.name || 'Unknown Client'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center font-bold text-[#111827]">
                        <DollarSign className="w-3.5 h-3.5 text-[#6b7280] mr-1" />
                        {contract.value.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-[#6b7280] font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'} 
                        {' → '} 
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownload(contract.id, contract.s3Key)}
                          className="p-2 text-[#6b7280] hover:text-[#111827] transition-colors rounded-md hover:bg-white shadow-sm border border-transparent hover:border-[#f4f5f7]" 
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(contract)}
                          className="p-2 text-[#6b7280] hover:text-[#111827] transition-colors rounded-md hover:bg-white shadow-sm border border-transparent hover:border-[#f4f5f7]" 
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(contract.id, contract.title)}
                          className="p-2 text-[#6b7280] hover:text-[#f03e3e] transition-colors rounded-md hover:bg-[#f03e3e]/10 border border-transparent hover:border-[#f03e3e]/20" 
                          title="Delete Contract"
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

      {/* Edit Contract Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-[24px] w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#f4f5f7]">
              <h3 className="text-lg font-bold tracking-tight text-[#111827]">Edit Contract</h3>
              <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="text-[#6b7280] hover:text-[#111827] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Contract Title</label>
                <input 
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Value ($)</label>
                <input 
                  required
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">Start Date</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">End Date</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Status</label>
                <select 
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#f4f5f7] mt-2">
                <button 
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                  className="bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Contract Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-[24px] w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#f4f5f7]">
              <h3 className="text-lg font-bold tracking-tight text-[#111827]">Upload Existing Contract</h3>
              <button onClick={() => { setIsUploadModalOpen(false); resetForm(); }} className="text-[#6b7280] hover:text-[#111827] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* File Drop Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  {file ? file.name : "Click to select a file"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX, or Images up to 10MB"}
                </p>
                <input 
                  type="file"
                  required
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Select Client</label>
                <select 
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                >
                  <option value="" disabled>Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">Contract Title</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Signed SLA"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">Value ($)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">Start Date (Optional)</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">End Date (Optional)</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#f4f5f7] mt-2">
                <button 
                  type="button"
                  onClick={() => { setIsUploadModalOpen(false); resetForm(); }}
                  className="bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || !file || clients.length === 0}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Uploading...' : 'Upload Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Contract Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-[24px] w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#f4f5f7]">
              <h3 className="text-lg font-bold tracking-tight text-[#111827]">Generate Contract</h3>
              <button onClick={() => { setIsGenerateModalOpen(false); resetForm(); }} className="text-[#6b7280] hover:text-[#111827] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Select Client</label>
                <select 
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                >
                  <option value="" disabled>Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Contract Title</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. SEO Retainer Q3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Full Contract Content (Raw Text)</label>
                <textarea 
                  required
                  placeholder="Paste the entire contract text here... It will be formatted beautifully into the PDF."
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  className="w-full flex rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors min-h-[250px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">Price ($)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">Start Date</label>
                  <input 
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#111827]">End Date</label>
                  <input 
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#f4f5f7] mt-2">
                <button 
                  type="button"
                  onClick={() => { setIsGenerateModalOpen(false); resetForm(); }}
                  className="bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || clients.length === 0}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Generating PDF...' : 'Generate & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
