"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp, CheckCircle2, Users, Target, FileText, BarChart3, Clock, Zap, Star, Check } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ── Scroll-fade utility ──────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: "#f9f9f8", color: "#181826" }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-6">
        <header className="flex items-center justify-between py-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4b6bfb]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#181826]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#181826]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#181826]" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Growwzzy</span>
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-9">
            {["Features", "Solutions", "Resources", "Pricing"].map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} className="text-sm font-medium text-[#181826]/80 hover:text-[#181826] transition-colors">{n}</a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-[#181826]/80 hover:text-[#181826] transition-colors">Sign in</Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-[#181826]/20 text-[#181826] hover:bg-[#181826] hover:text-white transition-all"
            >
              Get demo
            </Link>
          </div>
        </header>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <main className="pb-24">
        <div className="w-full max-w-7xl mx-auto px-6">

          {/* Hero Canvas */}
          <section
            className="relative overflow-hidden rounded-[2rem] border border-[#e1e1e7] px-6 pt-20 pb-32 sm:pt-24 sm:pb-40 md:pt-28 md:pb-48"
            style={{
              backgroundColor: "#f4f4f3",
              backgroundImage: `radial-gradient(circle, rgba(150,150,170,0.45) 1px, transparent 1px), radial-gradient(circle, rgba(150,150,170,0.25) 1px, transparent 1px)`,
              backgroundSize: "18px 18px, 18px 18px",
              backgroundPosition: "0 0, 9px 9px",
            }}
          >

            {/* ── Sticky Note (top-left) ── */}
            <div className="absolute left-4 top-4 sm:left-10 sm:top-10 w-52 -rotate-6">
              <div
                className="relative rounded px-5 py-5 shadow-xl"
                style={{ backgroundColor: "#fef3c7", color: "#4a3a1f", boxShadow: "0 2px 4px rgb(0 0 0 / 0.04), 0 20px 40px -16px rgb(15 23 42 / 0.12)" }}
              >
                {/* Pin */}
                <svg className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-12 w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                </svg>
                <p style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.2rem", lineHeight: 1.35, fontWeight: 500 }}>
                  Track every lead, close every deal, and grow your agency with ease.
                </p>
              </div>
              {/* Floating check badge */}
              <div
                className="mt-3 ml-6 flex items-center justify-center w-14 h-14 rounded-xl rotate-3 shadow-lg"
                style={{ backgroundColor: "#fff" }}
              >
                <svg className="w-7 h-7 text-[#4b6bfb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>

            {/* ── Reminders Card (top-right) ── */}
            <div className="absolute right-4 top-6 sm:right-8 md:right-12 w-64 rotate-3 hidden md:block">
              {/* Floating icon */}
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl mb-3 ml-auto mr-10 -rotate-6 shadow-lg"
                style={{ backgroundColor: "#fff" }}
              >
                <svg className="w-5 h-5 text-[#181826]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              {/* Card body */}
              <div className="rounded-2xl bg-white p-5 shadow-xl" style={{ boxShadow: "0 2px 4px rgb(0 0 0 / 0.04), 0 20px 40px -16px rgb(15 23 42 / 0.12)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6c6c7d] mb-1">Reminders</p>
                <p className="text-xs text-[#6c6c7d]">Prospects</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#181826]">Follow-up: Rahul S.</p>
                  <p className="text-xs text-[#6c6c7d] mt-0.5">Awaiting contract approval</p>
                </div>
                <div className="mt-4 border-t border-[#e1e1e7] pt-3">
                  <p className="text-xs text-[#6c6c7d]">Time</p>
                  <span className="inline-flex items-center gap-1.5 mt-1 rounded-md bg-[#e6eaff] px-2 py-1 text-xs font-medium text-[#4b6bfb]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4b6bfb]" />
                    11:00 — 11:30
                  </span>
                </div>
              </div>
            </div>

            {/* ── Center ── */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* Logo dots */}
              <div className="grid grid-cols-2 gap-1.5 w-16 h-16 p-3 rounded-2xl bg-white shadow-xl mb-0" style={{ boxShadow: "0 2px 4px rgb(0 0 0 / 0.04), 0 20px 40px -16px rgb(15 23 42 / 0.12)" }}>
                <span className="rounded-full bg-[#4b6bfb]" />
                <span className="rounded-full bg-[#181826]" />
                <span className="rounded-full bg-[#181826]" />
                <span className="rounded-full bg-[#181826]" />
              </div>

              <h1 className="mt-10 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.025em] leading-[1.1] text-[#181826]">
                Manage, grow, and
              </h1>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.025em] leading-[1.1] text-[#6c6c7d]">
                close deals faster.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#181826]/70 max-w-md leading-relaxed">
                The all-in-one workspace for your agency's team, leads, contracts, and finances.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "#4b6bfb", boxShadow: "0 10px 24px -8px rgb(75 107 251 / 0.55)" }}
              >
                Get started free
              </Link>
            </div>

            {/* ── Tasks Card (bottom-left) ── */}
            <div
              className="absolute left-2 -bottom-6 lg:left-10 w-72 -rotate-3 hidden md:block rounded-2xl bg-white p-5 shadow-xl"
              style={{ boxShadow: "0 2px 4px rgb(0 0 0 / 0.04), 0 20px 40px -16px rgb(15 23 42 / 0.12)" }}
            >
              <p className="text-sm font-semibold text-[#181826]">Today's tasks</p>
              {[
                { label: "Campaign proposal draft", date: "Jun 19", pct: 60, color: "#f97316" },
                { label: "Client contract — Sunil M.", date: "Jun 20", pct: 90, color: "#10b981" },
              ].map((t) => (
                <div key={t.label} className="mt-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-md text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: t.color }}
                    >{t.label[0]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#181826] truncate">{t.label}</p>
                      <p className="text-xs text-[#6c6c7d]">{t.date}</p>
                    </div>
                    <span className="text-xs font-medium text-[#6c6c7d]">{t.pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#ececf1] overflow-hidden">
                    <div className="h-full rounded-full bg-[#4b6bfb]" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Integrations / Team card (bottom-right) ── */}
            <div
              className="absolute right-2 -bottom-6 lg:right-10 w-60 rotate-3 hidden md:block rounded-2xl bg-white p-5 shadow-xl"
              style={{ boxShadow: "0 2px 4px rgb(0 0 0 / 0.04), 0 20px 40px -16px rgb(15 23 42 / 0.12)" }}
            >
              <p className="text-sm font-semibold text-[#181826]">Team Members</p>
              <div className="flex items-center gap-3 mt-4">
                {[
                  { label: "VG", bg: "#4b6bfb" },
                  { label: "MG", bg: "#a855f7" },
                  { label: "AA", bg: "#3b82f6" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-center w-14 h-14 rounded-2xl text-white text-sm font-bold shadow-sm"
                    style={{ backgroundColor: m.bg, boxShadow: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(15 23 42 / 0.08)" }}
                  >{m.label}</div>
                ))}
              </div>
            </div>

          </section>
        </div>
      </main>

      {/* ── Feature Strip ────────────────────────────────────────────────── */}
      <FadeIn className="border-y border-[#e1e1e7] bg-white/70 py-5">
        <div className="max-w-5xl mx-auto px-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            { icon: <Users className="w-4 h-4 text-teal-500" />, text: "Team Coordination" },
            { icon: <Target className="w-4 h-4 text-blue-500" />, text: "Leads CRM" },
            { icon: <FileText className="w-4 h-4 text-violet-500" />, text: "Smart Contracts" },
            { icon: <BarChart3 className="w-4 h-4 text-amber-500" />, text: "Revenue Dashboards" },
            { icon: <Clock className="w-4 h-4 text-rose-500" />, text: "Daily Check-ins" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-2 text-sm font-medium text-[#181826]/70">
              {f.icon}{f.text}
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Features Grid ────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4b6bfb] mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#181826] mb-4">
            Everything your agency needs.
          </h2>
          <p className="text-[#6c6c7d] text-lg max-w-xl mx-auto">
            From lead to invoice — manage the full agency workflow in one workspace.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: <Users className="w-5 h-5" />, color: "#e6eaff", iconColor: "#4b6bfb", title: "Team Hub", desc: "Daily check-ins, role-based access, and a live activity feed for your whole team.", badge: "Core" },
            { icon: <Target className="w-5 h-5" />, color: "#ede9fe", iconColor: "#8b5cf6", title: "Leads CRM", desc: "Kanban pipeline, instant WhatsApp & email shortcuts, and one-click status updates.", badge: "Popular" },
            { icon: <FileText className="w-5 h-5" />, color: "#e0f2fe", iconColor: "#0284c7", title: "Contract Generator", desc: "Create professional PDF contracts in 60 seconds and store them securely in the cloud.", badge: "New" },
            { icon: <BarChart3 className="w-5 h-5" />, color: "#fef3c7", iconColor: "#d97706", title: "Revenue Insights", desc: "Income logs, expense tracking, and revenue charts — always accurate and up-to-date.", badge: "Core" },
            { icon: <Clock className="w-5 h-5" />, color: "#fee2e2", iconColor: "#ef4444", title: "Activity Feed", desc: "A real-time timeline of every action across tasks, check-ins, and client updates.", badge: "Core" },
            { icon: <Check className="w-5 h-5" />, color: "#dcfce7", iconColor: "#16a34a", title: "Task Tracker", desc: "Assign tasks, set deadlines, and track progress across your entire team at a glance.", badge: "Core" },
          ].map((f, i) => (
            <FadeIn key={f.title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-[#e1e1e7] bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: f.color, color: f.iconColor }}>
                  {f.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#181826]">{f.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#ececf1] text-[#6c6c7d]">{f.badge}</span>
                </div>
                <p className="text-sm text-[#6c6c7d] leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <FadeIn className="pb-28 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl px-10 py-16 relative overflow-hidden" style={{ backgroundColor: "#181826" }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
              Your agency deserves<br />better tools.
            </h2>
            <p className="text-[#6c6c7d] text-lg mb-8">Set up in minutes. No credit card required.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white font-semibold text-[#181826] text-base hover:bg-[#f4f4f3] transition-all group"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e1e1e7] bg-white/60 py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4b6bfb]" />
              <span className="w-2 h-2 rounded-full bg-[#181826]" />
              <span className="w-2 h-2 rounded-full bg-[#181826]" />
              <span className="w-2 h-2 rounded-full bg-[#181826]" />
            </div>
            <span className="text-sm font-semibold text-[#181826]">Growwzzy</span>
          </div>
          <p className="text-sm text-[#6c6c7d]">© {new Date().getFullYear()} Growwzzy. Built for agencies.</p>
          <Link href="/login" className="text-sm text-[#6c6c7d] hover:text-[#181826] transition-colors">Sign in →</Link>
        </div>
      </footer>

    </div>
  )
}
