"use client"

import { Bell, Menu, UserCircle, LogOut, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<{name: string, role: string, email: string} | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
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

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold md:hidden text-primary">Growwzzy</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

          {isDropdownOpen && (
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
                  onClick={() => setIsDropdownOpen(false)}
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
