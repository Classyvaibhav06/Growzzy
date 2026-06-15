"use client"

import { Bell, Menu, UserCircle, LogOut, User, Check, CheckCircle2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [user, setUser] = useState<{name: string, role: string, email: string} | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.success && data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e)
    }
  }

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(console.error)

    fetchNotifications()
    
    // Optional: Poll every 60s
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return; // Already read
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    } catch (e) {
      console.error(e)
      fetchNotifications() // Revert on failure
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-40">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold md:hidden text-primary">Growwzzy</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-card border border-border ring-1 ring-black ring-opacity-5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex justify-between items-center">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <li 
                        key={notif.id} 
                        onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                        className={`px-4 py-3 hover:bg-muted transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.isRead ? (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <div className="h-2 w-2 mt-1 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {user?.name ? (
              <span className="text-xs font-bold text-foreground uppercase">
                {user.name.charAt(0)}
              </span>
            ) : (
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border ring-1 ring-black ring-opacity-5 divide-y divide-border z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-foreground">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {user?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-primary/10 text-primary">
                    {user.role}
                  </span>
                )}
              </div>
              <div className="py-1">
                <Link 
                  href="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  My Profile
                </Link>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
