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
    <header className="h-20 bg-transparent flex items-center justify-between px-6 lg:px-10 shrink-0 z-40">
      <div className="flex items-center gap-2 md:w-64">
        <div className="h-8 w-8 bg-[#2563eb] rounded-lg flex items-center justify-center transform -rotate-6">
          <div className="h-4 w-4 bg-white rounded-sm transform rotate-12" />
        </div>
        <h1 className="text-xl font-bold text-[#111827] tracking-tight ml-2">Growwzzy</h1>
        <button className="md:hidden text-[#6b7280] hover:text-[#111827] ml-auto">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* Search Bar (Centered) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="block w-full pl-10 pr-4 py-2.5 border-none rounded-full text-sm placeholder-[#9ca3af] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:w-64 justify-end">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-[#6b7280] hover:text-[#111827] transition-colors p-2 rounded-full bg-white shadow-sm hover:shadow-md"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444] ring-2 ring-white"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-[24px] shadow-lg bg-white border border-[#f4f5f7] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-[#f4f5f7] bg-[#f4f5f7]/50 flex justify-between items-center">
                <span className="font-bold text-sm text-[#111827]">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-[#2563eb] text-white px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[#6b7280]">
                    No new notifications
                  </div>
                ) : (
                  <ul className="divide-y divide-[#f4f5f7]">
                    {notifications.map((notif) => (
                      <li 
                        key={notif.id} 
                        onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                        className={`px-4 py-3 hover:bg-[#f4f5f7] transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-white' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.isRead ? (
                            <CheckCircle2 className="h-4 w-4 text-[#6b7280]" />
                          ) : (
                            <div className="h-2 w-2 mt-1 rounded-full bg-[#2563eb]" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'font-bold text-[#111827]' : 'font-medium text-[#6b7280]'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-[#6b7280] mt-0.5 line-clamp-2 font-medium">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-[#6b7280] mt-1 font-bold">
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
            className="h-10 w-10 rounded-full bg-white flex items-center justify-center border-none shadow-sm cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 overflow-hidden"
          >
            {user?.name ? (
              <span className="text-sm font-bold text-[#111827] uppercase">
                {user.name.charAt(0)}
              </span>
            ) : (
              <UserCircle className="h-6 w-6 text-[#6b7280]" />
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-[24px] shadow-lg bg-white border border-[#f4f5f7] divide-y divide-[#f4f5f7] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4">
                <p className="text-sm font-bold text-[#111827]">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-[#6b7280] truncate mt-0.5">{user?.email}</p>
                {user?.role && (
                  <span className="inline-block mt-2 px-2.5 py-1 text-[10px] uppercase font-bold rounded-full bg-[#111827] text-white">
                    {user.role}
                  </span>
                )}
              </div>
              <div className="py-2">
                <Link 
                  href="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-5 py-2 text-sm text-[#111827] font-bold hover:bg-[#f4f5f7] transition-colors mx-2 rounded-xl"
                >
                  <User className="mr-2 h-4 w-4 text-[#6b7280]" />
                  My Profile
                </Link>
              </div>
              <div className="py-2 pb-3">
                <button
                  onClick={handleLogout}
                  className="flex w-[calc(100%-16px)] mx-2 items-center px-3 py-2 text-sm font-bold text-[#f03e3e] hover:bg-[#f03e3e]/10 rounded-xl transition-colors"
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
