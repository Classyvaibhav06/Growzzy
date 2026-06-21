"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  CheckSquare, 
  KanbanSquare, 
  Users, 
  FileText, 
  Receipt, 
  Landmark,
  Settings,
  Shield,
  Loader2,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER'

const ALL_ROUTES = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
  { href: '/dashboard/checkins', label: 'Check-ins', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
  { href: '/dashboard/tasks', label: 'Tasks', icon: KanbanSquare, roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
  { href: '/dashboard/prospects', label: 'Prospects', icon: Target, roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { href: '/dashboard/contracts', label: 'Contracts', icon: FileText, roles: ['ADMIN', 'MANAGER'] },
  { href: '/dashboard/invoices', label: 'Invoices', icon: Receipt, roles: ['ADMIN', 'MANAGER'] },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Landmark, roles: ['ADMIN'] },
  { href: '/dashboard/team', label: 'Team', icon: Shield, roles: ['ADMIN'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.role) {
          setRole(data.user.role)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <aside className="w-64 bg-white rounded-[24px] hidden md:flex flex-col shadow-sm h-full overflow-hidden shrink-0">
      <nav className="flex-1 overflow-y-auto py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-[#6b7184]" />
          </div>
        ) : (
          <ul className="space-y-1 px-3">
            {ALL_ROUTES.filter(route => role && route.roles.includes(role)).map((route) => {
              const isActive = route.href === '/dashboard' 
                ? pathname === '/dashboard' 
                : pathname === route.href || pathname.startsWith(route.href + '/')
              return (
                <li key={route.href}>
                  <Link 
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-bold",
                      isActive 
                        ? "bg-[#2563eb]/10 text-[#2563eb]" 
                        : "text-[#6b7280] hover:bg-[#f4f5f7] hover:text-[#111827]"
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
