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
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground text-sm">Manage your personal account settings and security.</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border border-primary/20 uppercase shadow-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              name.charAt(0) || '?'
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                user?.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 
                user?.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-500' : 
                'bg-muted text-muted-foreground'
              }`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
          {message.text && (
            <div className={`p-3 text-sm rounded-md border ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-muted-foreground" /> Full Name
                </label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.name ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                />
                {errors.name && <p className="text-[0.8rem] font-medium text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-1.5 text-muted-foreground" /> Email Address
                </label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.email ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                />
                {errors.email && <p className="text-[0.8rem] font-medium text-destructive">{errors.email}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Security</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center">
                  <KeyRound className="w-4 h-4 mr-1.5 text-muted-foreground" /> Current Password
                </label>
                <input 
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.currentPassword ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                />
                {errors.currentPassword && <p className="text-[0.8rem] font-medium text-destructive">{errors.currentPassword}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center">
                  <Shield className="w-4 h-4 mr-1.5 text-muted-foreground" /> New Password
                </label>
                <input 
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.newPassword ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                />
                {errors.newPassword && <p className="text-[0.8rem] font-medium text-destructive">{errors.newPassword}</p>}
              </div>
            </div>
            {newPassword && !errors.newPassword && (
              <p className="text-xs text-muted-foreground mt-2">
                Password must be at least 8 characters, contain one uppercase letter, and one number.
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-md text-sm font-medium flex items-center transition-colors"
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
