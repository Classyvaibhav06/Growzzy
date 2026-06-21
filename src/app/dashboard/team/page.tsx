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
      <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f7]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Team Management</h2>
          <p className="text-[#6b7280] text-sm mt-1">Manage access, roles, and profiles for your agency team.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2"
        >
          Add Team Member
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isPageLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-[24px] border border-[#f4f5f7] bg-white shadow-sm overflow-hidden">
              <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-[#f4f5f7] relative">
                <div className="absolute top-4 right-4">
                  <Skeleton className="h-4 w-16 rounded-full bg-[#f4f5f7]" />
                </div>
                <Skeleton className="h-16 w-16 rounded-full mb-4 bg-[#f4f5f7]" />
                <Skeleton className="h-6 w-32 mb-2 bg-[#f4f5f7]" />
                <Skeleton className="h-4 w-40 bg-[#f4f5f7]" />
              </div>
              <div className="p-4 bg-[#f4f5f7]/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 bg-[#f4f5f7]" />
                  <Skeleton className="h-6 w-16 bg-[#f4f5f7]" />
                </div>
                <Skeleton className="h-6 w-6 rounded-md bg-[#f4f5f7]" />
              </div>
            </div>
          ))
        ) : (
          users.map((user) => (
            <div key={user.id} className="rounded-[24px] border border-[#f4f5f7] bg-white shadow-sm hover:shadow-md overflow-hidden transition-all group">
              <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-[#f4f5f7] relative">
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-[#2563eb]/10 text-[#2563eb]' : 
                    user.role === 'MANAGER' ? 'bg-[#e8730a]/10 text-[#e8730a]' : 
                    'bg-[#f4f5f7] text-[#6b7280]'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full bg-[#f4f5f7] flex items-center justify-center text-2xl font-bold text-[#111827] uppercase overflow-hidden shadow-sm">
                    {uploadingUserId === user.id ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#111827]" />
                    ) : user.avatar ? (
                      <img src={`/api/users/${user.id}/avatar/proxy`} alt={user.name} className="rounded-full w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  {currentUser?.role === 'ADMIN' && (
                    <label 
                      className="absolute bottom-0 right-0 flex items-center justify-center bg-[#2563eb] text-white rounded-full w-6 h-6 cursor-pointer hover:bg-[#1d4ed8] shadow-sm ring-2 ring-white transition-transform hover:scale-105" 
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
                <h3 className="font-bold text-lg text-[#111827]">{user.name}</h3>
                <p className="text-[#6b7280] text-sm">{user.email}</p>
              </div>
              <div className="p-4 bg-[#f4f5f7]/30 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[#6b7280] font-bold">
                  <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-[#e5e7eb]">
                    {user._count?.assignedTasks || 0} Tasks
                  </span>
                  <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-[#e5e7eb]">
                    {user._count?.checkIns || 0} Check-ins
                  </span>
                </div>
                <button 
                  onClick={() => openEditModal(user)}
                  className="text-[#6b7280] hover:text-[#111827] p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#e5e7eb] shadow-sm opacity-0 group-hover:opacity-100 transition-all"
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
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#f4f5f7] shadow-xl rounded-[24px] w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#f4f5f7]">
              <h3 className="text-lg font-bold text-[#111827]">{editingUserId ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-[#6b7280] hover:text-[#111827] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {globalError && (
                <div className="rounded-md bg-[#f03e3e]/10 p-3 text-sm text-[#f03e3e] border border-[#f03e3e]/20 font-medium">
                  {globalError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827]">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors ${errors.name ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb]'}`}
                />
                {errors.name && <p className="text-[0.8rem] font-bold text-[#f03e3e] mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827]">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors ${errors.email ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb]'}`}
                />
                {errors.email && <p className="text-[0.8rem] font-bold text-[#f03e3e] mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827]">
                  {editingUserId ? 'New Password (leave blank to keep current)' : 'Temporary Password'}
                </label>
                <input 
                  type="password" 
                  required={!editingUserId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors ${errors.password ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb]'}`}
                />
                {errors.password && <p className="text-[0.8rem] font-bold text-[#f03e3e] mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827]">Role</label>
                <select 
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors ${errors.role ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb]'}`}
                >
                  <option value="TEAM_MEMBER">Team Member (Submit Check-ins, View Only)</option>
                  <option value="MANAGER">Manager (Assign Tasks, View Reports)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
                {errors.role && <p className="text-[0.8rem] font-bold text-[#f03e3e] mt-1">{errors.role}</p>}
              </div>

              <div className="pt-6 flex justify-between items-center">
                {editingUserId ? (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-[#f03e3e] hover:text-[#c92a2a] text-sm font-bold px-2 py-1 transition-colors"
                  >
                    Delete Member
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    className="bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-transform active:scale-95 disabled:opacity-50"
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
