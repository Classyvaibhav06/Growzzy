"use client"

import { useState, useEffect } from 'react'
import { User, Mail, Shield, Loader2, Save, KeyRound } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  const [message, setMessage] = useState({ type: '', text: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setName(data.user.name)
          setEmail(data.user.email)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    setErrors({})

    try {
      const payload: any = { name, email }
      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        // Refresh session if needed
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
          setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">My Profile</h2>
        <p className="text-[#6b7280] text-sm mt-1">Manage your personal account settings and security.</p>
      </div>

      <div className="rounded-[24px] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f4f5f7] bg-[#f4f5f7]/30 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-[#f4f5f7] flex items-center justify-center text-3xl font-bold text-[#111827] uppercase shadow-sm">
            {user?.avatar ? (
              <img src={`/api/users/${user.id}/avatar/proxy`} alt={user.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              name.charAt(0) || '?'
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#111827]">{user?.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${
                user?.role === 'ADMIN' ? 'bg-[#2563eb]/10 text-[#2563eb]' : 
                user?.role === 'MANAGER' ? 'bg-[#e8730a]/10 text-[#e8730a]' : 
                'bg-[#f4f5f7] text-[#6b7280]'
              }`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
          {message.text && (
            <div className={`p-3 text-sm rounded-md border font-medium ${
              message.type === 'success' 
                ? 'bg-[#0aa06e]/10 text-[#0aa06e] border-[#0aa06e]/20' 
                : 'bg-[#f03e3e]/10 text-[#f03e3e] border-[#f03e3e]/20'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#6b7280]">Personal Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827] flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-[#6b7280]" /> Full Name
                </label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-colors ${errors.name ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb] focus-visible:bg-white'}`}
                />
                {errors.name && <p className="text-[0.8rem] font-bold text-[#f03e3e]">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827] flex items-center">
                  <Mail className="w-4 h-4 mr-1.5 text-[#6b7280]" /> Email Address
                </label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-colors ${errors.email ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb] focus-visible:bg-white'}`}
                />
                {errors.email && <p className="text-[0.8rem] font-bold text-[#f03e3e]">{errors.email}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f4f5f7]">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#6b7280] mb-4">Security</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827] flex items-center">
                  <KeyRound className="w-4 h-4 mr-1.5 text-[#6b7280]" /> Current Password
                </label>
                <input 
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-colors ${errors.currentPassword ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb] focus-visible:bg-white'}`}
                />
                {errors.currentPassword && <p className="text-[0.8rem] font-bold text-[#f03e3e]">{errors.currentPassword}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827] flex items-center">
                  <Shield className="w-4 h-4 mr-1.5 text-[#6b7280]" /> New Password
                </label>
                <input 
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full flex h-10 rounded-xl border bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-colors ${errors.newPassword ? 'border-[#f03e3e] focus-visible:ring-[#f03e3e]/50' : 'border-[#e5e7eb] focus-visible:bg-white'}`}
                />
                {errors.newPassword && <p className="text-[0.8rem] font-bold text-[#f03e3e]">{errors.newPassword}</p>}
              </div>
            </div>
            {newPassword && !errors.newPassword && (
              <p className="text-xs text-[#6b7280] font-medium mt-2">
                Password must be at least 8 characters, contain one uppercase letter, and one number.
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-6 py-2.5 rounded-xl text-sm font-bold flex items-center transition-transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
