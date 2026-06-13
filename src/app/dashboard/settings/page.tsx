"use client"

import { useState } from 'react'
import { User, Building2, Bell, Shield, Paintbrush, Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('agency')
  const [isLoading, setIsLoading] = useState(false)

  // Agency Form State
  const [agencyName, setAgencyName] = useState('Growwzzy Agency')
  const [website, setWebsite] = useState('https://growwzzy.com')
  const [address, setAddress] = useState('123 Marketing St, Suite 100')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert('Settings saved successfully!')
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-sm">Manage your agency preferences and global settings.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('agency')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'agency' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Agency Details
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'appearance' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <Paintbrush className="w-4 h-4" />
              Appearance
            </button>
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <form onSubmit={handleSave} className="p-6">
              
              {/* Agency Tab */}
              {activeTab === 'agency' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Agency Details</h3>
                    <p className="text-sm text-muted-foreground">Update your agency's public information for invoices and contracts.</p>
                  </div>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Agency Name</label>
                      <input 
                        type="text" 
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Website</label>
                      <input 
                        type="url" 
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Business Address</label>
                      <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Choose what updates you want to receive.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Task Assignments</p>
                        <p className="text-sm text-muted-foreground">Receive an email when a task is assigned to you.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Contract Signatures</p>
                        <p className="text-sm text-muted-foreground">Get notified when a client signs a contract.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">Invoice Payments</p>
                        <p className="text-sm text-muted-foreground">Get alerted when an invoice is marked as paid.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">Customize the look and feel of your dashboard.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border-2 border-primary rounded-lg p-4 cursor-pointer text-center relative">
                      <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
                      <div className="w-full h-20 bg-[#0F172A] rounded mb-3 flex items-center justify-center border border-border">
                        <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                      </div>
                      <p className="font-medium text-sm">Deep Dark (Default)</p>
                    </div>
                    <div className="border border-border hover:border-primary/50 rounded-lg p-4 cursor-pointer text-center transition-colors opacity-50">
                      <div className="w-full h-20 bg-gray-100 rounded mb-3 flex items-center justify-center border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                      </div>
                      <p className="font-medium text-sm text-muted-foreground">Light Mode</p>
                      <span className="text-[10px] uppercase font-bold text-primary mt-1 block">Coming Soon</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
