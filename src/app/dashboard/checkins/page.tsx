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
      <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f7]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Daily Check-ins</h2>
          <p className="text-[#6b7280] text-sm mt-1">Submit your daily progress and view team updates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submit Form */}
        <div className="md:col-span-1 rounded-[24px] bg-white p-6 shadow-sm h-fit">
          <h3 className="font-bold mb-5 text-[#111827]">Submit Check-in</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#111827]">What did you do yesterday?</label>
              <textarea 
                required
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                className="mt-1.5 flex w-full rounded-xl border border-transparent bg-[#f4f5f7] px-4 py-3 text-sm text-[#111827] placeholder:text-[#6b7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] min-h-[80px] transition-all"
                placeholder="Completed homepage UI..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827]">What will you do today?</label>
              <textarea 
                required
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="mt-1.5 flex w-full rounded-xl border border-transparent bg-[#f4f5f7] px-4 py-3 text-sm text-[#111827] placeholder:text-[#6b7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] min-h-[80px] transition-all"
                placeholder="Start working on API integrations..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827]">Any blockers? (Optional)</label>
              <textarea 
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                className="mt-1.5 flex w-full rounded-xl border border-transparent bg-[#f4f5f7] px-4 py-3 text-sm text-[#111827] placeholder:text-[#6b7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] min-h-[60px] transition-all"
                placeholder="Waiting on design assets..."
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8] h-11 px-6 shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Check-in'}
            </button>
          </form>
        </div>

        {/* Feed */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold px-1 text-[#111827]">Recent Check-ins</h3>
          {isPageLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="rounded-[24px] bg-white p-6 shadow-sm">
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
            <div className="rounded-[24px] p-10 text-center text-[#6b7280] bg-[#f4f5f7]">
              No check-ins found.
            </div>
          ) : (
            checkIns.map((ci) => (
              <div key={ci.id} className="rounded-[24px] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f4f5f7] flex items-center justify-center text-[#111827] font-bold">
                      {ci.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{ci.user?.name}</p>
                      <p className="text-xs text-[#6b7280]">{new Date(ci.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-sm bg-[#f4f5f7] p-4 rounded-xl">
                  <div>
                    <span className="font-bold text-[#111827] block mb-1">Yesterday</span>
                    <span className="text-[#4b5263] leading-relaxed">{ci.yesterday}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#111827] block mb-1">Today</span>
                    <span className="text-[#4b5263] leading-relaxed">{ci.today}</span>
                  </div>
                  {ci.blockers && (
                    <div>
                      <span className="font-bold text-red-600 block mb-1">Blockers</span>
                      <span className="text-red-700/80 leading-relaxed">{ci.blockers}</span>
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
