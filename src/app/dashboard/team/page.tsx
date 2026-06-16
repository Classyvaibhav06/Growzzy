"use client"

import { useState, useEffect } from 'react'
import { Shield, User, Settings2, X, Loader2, Upload } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadingUserId, setUploadingUserId] = useState<string | null>(null)
  
  // Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('TEAM_MEMBER')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')

  useEffect(() => {
    Promise.all([fetchUsers(), fetchCurrentUser()]).finally(() => setIsPageLoading(false))
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me')
      const data = await res.json()
      if (data.user) setCurrentUser(data.user)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const resetForm = () => {
    setEditingUserId(null)
    setName('')
    setEmail('')
    setPassword('')
    setRole('TEAM_MEMBER')
    setErrors({})
    setGlobalError('')
  }

  const handleAvatarUpload = async (userId: string, file: File | null) => {
    if (!file) return
    setUploadingUserId(userId)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/users/${userId}/avatar`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
      } else {
        alert(data.error || 'Failed to upload avatar')
      }
    } catch (error) {
      alert('An error occurred while uploading the avatar')
    } finally {
      setUploadingUserId(null)
    }
  }

  const openEditModal = (user: any) => {
    setEditingUserId(user.id)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setPassword('')
    setErrors({})
    setGlobalError('')
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingUserId) return
    if (!confirm('Are you sure you want to delete this team member? This action cannot be undone.')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${editingUserId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        fetchUsers()
        resetForm()
        alert('Team member deleted successfully.')
      } else {
        setGlobalError(data.error || 'Failed to delete user')
      }
    } catch (error) {
      setGlobalError('An error occurred while deleting the team member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGlobalError('')

    const isEditing = !!editingUserId
    const url = isEditing ? `/api/users/${editingUserId}` : '/api/users'
    const method = isEditing ? 'PATCH' : 'POST'

    const payload: any = { name, email, role }
    if (password || !isEditing) payload.password = password

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        fetchUsers()
        resetForm()
        alert(`Successfully ${isEditing ? 'updated' : 'added'} ${name}!`)
      } else {
        if (data.fields) {
          const fieldErrors: Record<string, string> = {}
          data.fields.forEach((f: any) => {
            if (f.path && f.path.length > 0) {
              fieldErrors[f.path[0]] = f.message
            }
          })
          setErrors(fieldErrors)
        } else {
          setGlobalError(data.error || `Failed to ${isEditing ? 'update' : 'add'} user. Are you logged in as an Admin?`)
        }
      }
    } catch (error) {
      console.error(error)
      setGlobalError(`An error occurred while ${isEditing ? 'updating' : 'adding'} the team member`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground text-sm">Manage access, roles, and profiles for your agency team.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Team Member
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isPageLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-border relative">
                <div className="absolute top-4 right-4">
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="p-4 bg-muted/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
            </div>
          ))
        ) : (
          users.map((user) => (
            <div key={user.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:border-primary/50 transition-colors">
              <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-border relative">
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 
                    user.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20 uppercase overflow-hidden shadow-sm">
                    {uploadingUserId === user.id ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : user.avatar ? (
                      <img src={`/api/users/${user.id}/avatar/proxy`} alt={user.name} className="rounded-full w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  {currentUser?.role === 'ADMIN' && (
                    <label 
                      className="absolute bottom-0 right-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full w-6 h-6 cursor-pointer hover:bg-primary/90 shadow-md ring-2 ring-card transition-transform hover:scale-105" 
                      title="Upload Avatar"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload(user.id, e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
              <div className="p-4 bg-muted/30 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <span className="bg-background px-2 py-1 rounded border border-border">
                    {user._count?.assignedTasks || 0} Tasks
                  </span>
                  <span className="bg-background px-2 py-1 rounded border border-border">
                    {user._count?.checkIns || 0} Check-ins
                  </span>
                </div>
                <button 
                  onClick={() => openEditModal(user)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Team Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold tracking-tight">{editingUserId ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {globalError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
                  {globalError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.name ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                />
                {errors.name && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.email ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                />
                {errors.email && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {editingUserId ? 'New Password (leave blank to keep current)' : 'Temporary Password'}
                </label>
                <input 
                  type="password" 
                  required={!editingUserId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.password ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                />
                {errors.password && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Role</label>
                <select 
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.role ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                >
                  <option value="TEAM_MEMBER">Team Member (Submit Check-ins, View Only)</option>
                  <option value="MANAGER">Manager (Assign Tasks, View Reports)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
                {errors.role && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.role}</p>}
              </div>

              <div className="pt-4 flex justify-between items-center">
                {editingUserId ? (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive/80 text-sm font-medium px-2 py-1 transition-colors"
                  >
                    Delete Member
                  </button>
                ) : <div />}
                
                <div className="flex gap-2">
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
                    {isLoading ? 'Saving...' : (editingUserId ? 'Save Changes' : 'Add Member')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
