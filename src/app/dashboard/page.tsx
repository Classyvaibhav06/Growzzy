"use client"

import { useState, useEffect } from 'react'
import { Users, Briefcase, Clock, FileCheck, Loader2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardOverview() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard/overview')
        const json = await res.json()
        if (json.success) {
          setData(json)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const stats = [
    { title: "Total Clients", value: data?.stats?.totalClients || 0, icon: Users, color: "text-blue-500" },
    { title: "Active Projects", value: data?.stats?.activeProjects || 0, icon: Briefcase, color: "text-purple-500" },
    { title: "Pending Tasks", value: data?.stats?.pendingTasks || 0, icon: Clock, color: "text-orange-500" },
    { title: "Recent Check-ins", value: data?.stats?.recentCheckIns || 0, icon: FileCheck, color: "text-green-500" },
  ]

  // Time formatter
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Yesterday'
    return `${diffInDays} days ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm col-span-4 min-h-[400px] p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Daily income vs expenses (last 30 days)</p>
          </div>
          <div className="w-full h-[300px] mt-4">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-lg" />
            ) : data?.revenueData && data.revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`$${value}`, undefined]}
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-border text-muted-foreground">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm col-span-3 min-h-[400px] p-6 overflow-y-auto">
          <div className="flex flex-col space-y-1.5 pb-4 sticky top-0 bg-card z-10">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest actions and updates</p>
          </div>
          <div className="space-y-4 mt-4">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 pb-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : data?.recentActivity?.length > 0 ? (
              data.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 border-b border-border pb-4 last:border-0">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-primary/20">
                    {activity.user?.avatar ? (
                      <img src={`/api/users/${activity.user.id}/avatar/proxy`} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      activity.user?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {activity.user?.name || 'Unknown'} <span className="font-normal text-muted-foreground">{activity.message}</span>
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.date)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center pt-8">
                No recent activity to display
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
