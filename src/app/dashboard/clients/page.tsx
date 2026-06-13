"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, X, Loader2, Edit, Trash2 } from 'lucide-react'
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
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground text-sm">Manage client directory and profiles.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          + Add Client
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isPageLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
              <div className="bg-muted/50 px-6 py-3 border-t border-border flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full rounded-xl border border-border border-dashed p-12 text-center text-muted-foreground">
            No clients added yet.
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:border-primary/50 transition-colors">
              <div className="p-6 relative group">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditClick(client)} className="p-1.5 text-muted-foreground hover:text-primary bg-muted rounded-md transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(client.id, client.name)} className="p-1.5 text-muted-foreground hover:text-red-500 bg-muted rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-start mb-4 pr-16">
                  <div>
                    <h3 className="font-bold text-lg">{client.name}</h3>
                    {client.company && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary uppercase">
                    {client.name.charAt(0)}
                  </div>
                </div>
                
                <div className="space-y-2 mt-6">
                  {client.email && (
                    <div className="flex items-center text-sm gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center text-sm gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-muted/50 px-6 py-3 border-t border-border flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">
                  {client._count?.projects || 0} Projects
                </span>
                <Link href={`/dashboard/clients/${client.id}`} className="text-primary hover:underline font-medium">
                  View Profile &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold tracking-tight">{editingId ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-muted-foreground hover:text-foreground">
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

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center"
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
