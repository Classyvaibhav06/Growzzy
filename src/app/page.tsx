"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, TrendingUp, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation */}
      <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">Growwzzy</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 relative overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

        <Badge variant="secondary" className="mb-6 px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
          ✨ Premium Management Platform
        </Badge>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 text-foreground">
          Elevate Your Team's <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            Productivity & Growth
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The all-in-one internal management tool. Track daily check-ins, manage deadlines, handle client contracts, and generate invoices seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group" asChild>
            <Link href="/login">
              Book a Free Consultation Today!
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto w-full text-left">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Team Coordination</h3>
            <p className="text-muted-foreground">Keep everyone aligned with daily check-ins, task assignments, and progress tracking.</p>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Financial Insights</h3>
            <p className="text-muted-foreground">Seamlessly manage accounts, log expenses, record incomes, and automatically generate professional invoices.</p>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Contracts</h3>
            <p className="text-muted-foreground">Store and manage client contracts securely in one centralized repository with role-based access.</p>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Growwzzy. All rights reserved.</p>
      </footer>
    </div>
  )
}
