"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, X, Loader2, Edit, Trash2, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchClients().finally(() => setIsPageLoading(false))
  }, [])

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
    setName('')
    setCompany('')
    setEmail('')
    setPhone('')
    setAddress('')
    setNotes('')
  }

  const handleEditClick = (client: any) => {
    setEditingId(client.id)
    setName(client.name || '')
    setCompany(client.company || '')
    setEmail(client.email || '')
    setPhone(client.phone || '')
    setAddress(client.address || '')
    setNotes(client.notes || '')
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (id: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchClients()
      } else {
        alert(data.error || 'Failed to delete client')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while deleting the client')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingId ? `/api/clients/${editingId}` : '/api/clients'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company: company || undefined,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
          notes: notes || undefined,
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        fetchClients()
        resetForm()
      } else {
        alert(data.error || `Failed to ${editingId ? 'update' : 'add'} client`)
      }
    } catch (error) {
      console.error(error)
      alert(`An error occurred while ${editingId ? 'updating' : 'adding'} the client`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f7]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Clients</h2>
          <p className="text-[#6b7280] text-sm mt-1">Manage client directory and profiles.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isPageLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-[24px] bg-white shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4 pr-16">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="space-y-3 mt-6">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <div className="bg-[#f4f5f7] px-6 py-4 flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full rounded-[24px] p-12 text-center text-[#6b7280] bg-[#f4f5f7]">
            <p className="font-bold text-[#111827] mb-1">No clients added yet.</p>
            <p className="text-sm">Click "Add Client" to get started.</p>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="rounded-[24px] bg-white shadow-sm hover:shadow-md overflow-hidden transition-all group">
              <div className="p-6 relative">
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditClick(client)} className="p-2 text-[#6b7280] hover:text-[#111827] hover:bg-[#f4f5f7] rounded-lg transition-colors border border-transparent hover:border-[#f4f5f7]">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(client.id, client.name)} className="p-2 text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-start mb-5 pr-16">
                  <div>
                    <h3 className="font-bold text-xl text-[#111827]">{client.name}</h3>
                    {client.company && (
                      <div className="flex items-center text-sm text-[#6b7280] mt-1.5 gap-1.5 font-medium">
                        <Building2 className="w-4 h-4" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-full bg-[#f4f5f7] flex items-center justify-center text-xl font-bold text-[#111827] uppercase">
                    {client.name.charAt(0)}
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  {client.email && (
                    <div className="flex items-center text-sm gap-2.5">
                      <div className="bg-[#f4f5f7] p-1.5 rounded-md">
                        <Mail className="w-4 h-4 text-[#6b7280]" />
                      </div>
                      <span className="text-[#4b5263]">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm gap-2.5">
                      <div className="bg-[#f4f5f7] p-1.5 rounded-md">
                        <Phone className="w-4 h-4 text-[#6b7280]" />
                      </div>
                      <span className="text-[#4b5263]">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center text-sm gap-2.5">
                      <div className="bg-[#f4f5f7] p-1.5 rounded-md">
                        <MapPin className="w-4 h-4 text-[#6b7280]" />
                      </div>
                      <span className="truncate text-[#4b5263]">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[#f4f5f7] px-6 py-4 flex justify-between items-center text-sm">
                <span className="font-bold text-[#6b7280] uppercase tracking-wider text-xs">
                  {client._count?.projects || 0} Projects
                </span>
                <Link href={`/dashboard/clients/${client.id}`} className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline font-bold flex items-center gap-1">
                  View Profile &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-[24px] w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#f4f5f7]">
              <h3 className="text-lg font-bold tracking-tight text-[#111827]">{editingId ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-[#6b7280] hover:text-[#111827] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name *</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Company Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <input 
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Address</label>
                <input 
                  type="text"
                  placeholder="123 Business St, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#f4f5f7] mt-2">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="bg-white text-[#111827] border border-[#e5e7eb] hover:bg-[#f4f5f7] px-4 py-2 rounded-xl text-sm font-bold transition-transform active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
