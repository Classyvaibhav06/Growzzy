"use client"

import { useState, useEffect } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [yesterday, setYesterday] = useState('')
  const [today, setToday] = useState('')
  const [blockers, setBlockers] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCheckIns().finally(() => setIsPageLoading(false))
  }, [])

  const fetchCheckIns = async () => {
    try {
      const res = await fetch('/api/checkins')
      const data = await res.json()
      if (data.checkIns) setCheckIns(data.checkIns)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yesterday, today, blockers }),
      })
      if (res.ok) {
        setYesterday('')
        setToday('')
        setBlockers('')
        fetchCheckIns()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Check-ins</h2>
          <p className="text-muted-foreground text-sm">Submit your daily progress and view team updates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submit Form */}
        <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm h-fit">
          <h3 className="font-semibold mb-4">Submit Check-in</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">What did you do yesterday?</label>
              <textarea 
                required
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                placeholder="Completed homepage UI..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">What will you do today?</label>
              <textarea 
                required
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                placeholder="Start working on API integrations..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Any blockers? (Optional)</label>
              <textarea 
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[60px]"
                placeholder="Waiting on design assets..."
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {loading ? 'Submitting...' : 'Submit Check-in'}
            </button>
          </form>
        </div>

        {/* Feed */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-semibold px-1">Recent Check-ins</h3>
          {isPageLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))
          ) : checkIns.length === 0 ? (
            <div className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground">
              No check-ins found.
            </div>
          ) : (
            checkIns.map((ci) => (
              <div key={ci.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {ci.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{ci.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(ci.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-primary">Yesterday: </span>
                    <span className="text-muted-foreground">{ci.yesterday}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary">Today: </span>
                    <span className="text-muted-foreground">{ci.today}</span>
                  </div>
                  {ci.blockers && (
                    <div>
                      <span className="font-semibold text-destructive">Blockers: </span>
                      <span className="text-muted-foreground">{ci.blockers}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
