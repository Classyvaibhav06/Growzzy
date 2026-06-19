"use client"

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Trash2, ChevronDown, Search, LayoutGrid, List, MessageCircle, Mail } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type ProspectStatus = 'NEW' | 'CONTACTED' | 'CALL_BOOKED' | 'CLOSED' | 'LOST'

interface Prospect {
  id: string
  name: string
  phone: string | null
  email: string | null
  instagram: string | null
  linkedin: string | null
  source: string | null
  status: ProspectStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  owner: { id: string; name: string }
}

const STATUS_OPTIONS: ProspectStatus[] = ['NEW', 'CONTACTED', 'CALL_BOOKED', 'CLOSED', 'LOST']

const STATUS_STYLES: Record<ProspectStatus, { pill: string; label: string }> = {
  NEW:        { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    label: 'New' },
  CONTACTED:  { pill: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Contacted' },
  CALL_BOOKED:{ pill: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Call Booked' },
  CLOSED:     { pill: 'bg-green-500/10 text-green-400 border-green-500/20',  label: 'Closed' },
  LOST:       { pill: 'bg-red-500/10 text-red-400 border-red-500/20',       label: 'Lost' },
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState<ProspectStatus>('NEW')
  const [notes, setNotes] = useState('')

  // Edit
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [editStatus, setEditStatus] = useState<ProspectStatus>('NEW')

  useEffect(() => {
    fetchProspects()
  }, [filterStatus])

  const fetchProspects = async () => {
    setIsPageLoading(true)
    try {
      const url = filterStatus === 'All' ? '/api/prospects' : `/api/prospects?status=${filterStatus}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.prospects) setProspects(data.prospects)
    } catch (e) {
      console.error(e)
    } finally {
      setIsPageLoading(false)
    }
  }

  const resetForm = () => {
    setName(''); setPhone(''); setEmail(''); setInstagram('')
    setLinkedin(''); setSource(''); setStatus('NEW'); setNotes('')
    setEditingProspect(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: phone || undefined, email: email || undefined, instagram: instagram || undefined, linkedin: linkedin || undefined, source: source || undefined, status, notes: notes || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        resetForm()
        fetchProspects()
      } else {
        alert(data.error || 'Failed to save prospect')
      }
    } catch (e) {
      console.error(e)
      alert('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (prospectId: string, newStatus: ProspectStatus) => {
    setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, status: newStatus } : p))
    try {
      await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (e) {
      console.error(e)
      fetchProspects() // revert on error
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete prospect "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/prospects/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) fetchProspects()
      else alert(data.error || 'Failed to delete')
    } catch (e) {
      console.error(e)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filterOptions = ['All', ...STATUS_OPTIONS.map(s => STATUS_STYLES[s].label)]

  // Derived state
  const filteredProspects = prospects.filter(p => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.owner.name.toLowerCase().includes(q)
    )
  })

  const closedCount = prospects.filter(p => p.status === 'CLOSED').length
  const callBookedCount = prospects.filter(p => p.status === 'CALL_BOOKED').length
  const closingRate = prospects.length > 0 ? Math.round((closedCount / prospects.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prospects</h2>
          <p className="text-muted-foreground text-sm">{isPageLoading ? '...' : `${prospects.length} total prospect${prospects.length !== 1 ? 's' : ''}`}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          id="add-prospect-btn"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Prospect
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
          <p className="text-3xl font-bold mt-2">{prospects.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Calls Booked</p>
          <p className="text-3xl font-bold mt-2">{callBookedCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Closing Rate</p>
          <p className="text-3xl font-bold mt-2">{closingRate}%</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-card pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setIsFilterOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2 h-10 border border-border rounded-md bg-card text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
            >
              {filterStatus === 'All' ? 'All Statuses' : (STATUS_STYLES[filterStatus as ProspectStatus]?.label ?? filterStatus)}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 z-30 w-44 bg-card border border-border rounded-md shadow-lg overflow-hidden">
                {['All', ...STATUS_OPTIONS].map(opt => {
                  const label = opt === 'All' ? 'All Statuses' : STATUS_STYLES[opt as ProspectStatus].label
                  const isActive = filterStatus === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => { setFilterStatus(opt); setIsFilterOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${isActive ? 'text-primary font-semibold' : 'text-foreground hover:bg-muted'}`}
                    >
                      {isActive && <span className="text-primary">✓</span>}
                      {!isActive && <span className="w-4" />}
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Kanban Board View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
      <>
        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isPageLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))
              ) : filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="text-base font-medium">No prospects found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredProspects.map(prospect => (
                  <tr key={prospect.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{prospect.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {prospect.phone || '—'}
                        {prospect.phone && (
                          <a 
                            href={`https://wa.me/${prospect.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 rounded-full hover:bg-green-500/10 text-green-500 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {prospect.email ? (
                          <span className="truncate max-w-[150px] block" title={prospect.email}>{prospect.email}</span>
                        ) : '—'}
                        {prospect.email && (
                          <a 
                            href={`mailto:${prospect.email}`}
                            className="p-1 rounded-full hover:bg-primary/10 text-primary transition-colors shrink-0"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {prospect.source ? (
                        <span className="truncate max-w-[150px] block" title={prospect.source}>{prospect.source}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {/* Inline status changer */}
                      <div className="relative inline-block group/status">
                        <div className={`flex items-center justify-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold rounded-full border transition-opacity group-hover/status:opacity-80 ${STATUS_STYLES[prospect.status].pill}`}>
                          {STATUS_STYLES[prospect.status].label}
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </div>
                        <select
                          value={prospect.status}
                          onChange={(e) => handleStatusChange(prospect.id, e.target.value as ProspectStatus)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title="Change Status"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-background text-foreground">
                              {STATUS_STYLES[opt].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate" title={prospect.notes || ''}>
                      {prospect.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{prospect.owner.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(prospect.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(prospect.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(prospect.id, prospect.name)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md"
                        title="Delete prospect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
      <>
      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {STATUS_OPTIONS.map(status => (
          <div key={status} className="shrink-0 w-80 flex flex-col bg-muted/30 border border-border rounded-xl snap-start">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[status].pill.split(' ')[0]}`} />
                {STATUS_STYLES[status].label}
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {filteredProspects.filter(p => p.status === status).length}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto min-h-[400px] space-y-3">
              {filteredProspects.filter(p => p.status === status).map(prospect => (
                <div key={prospect.id} className="bg-card border border-border p-4 rounded-lg shadow-sm hover:shadow transition-shadow group relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{prospect.name}</h4>
                    {/* Status Changer Dropdown */}
                    <div className="relative">
                      <div className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors group-hover/btn:bg-muted">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                      <select
                        value={prospect.status}
                        onChange={(e) => handleStatusChange(prospect.id, e.target.value as ProspectStatus)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Move to another status"
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="bg-background text-foreground">
                            Move to {STATUS_STYLES[opt].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {prospect.source && (
                    <p className="text-xs text-muted-foreground mb-3">{prospect.source}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    {prospect.phone && (
                      <a href={`https://wa.me/${prospect.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-green-500 transition-colors" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    {prospect.email && (
                      <a href={`mailto:${prospect.email}`} className="text-muted-foreground hover:text-primary transition-colors" title="Email">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{prospect.owner.name}</span>
                  </div>
                </div>
              ))}
              {filteredProspects.filter(p => p.status === status).length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">Empty</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Click outside to close dropdowns */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
      )}

      {/* New Prospect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold">New Prospect</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm() }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <input
                  required value={name} onChange={e => setName(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Instagram</label>
                  <input placeholder="@handle" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">LinkedIn</label>
                  <input placeholder="URL or name" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Source</label>
                  <input placeholder="e.g. Instagram, LinkedIn" value={source} onChange={e => setSource(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as ProspectStatus)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSaving ? 'Saving...' : 'Save Prospect'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
