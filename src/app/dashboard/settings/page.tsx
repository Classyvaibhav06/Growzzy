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
      <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f7]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Settings</h2>
          <p className="text-[#6b7280] text-sm mt-1">Manage your agency preferences and global settings.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('agency')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === 'agency' ? 'bg-white shadow-sm border border-[#f4f5f7] text-[#111827] font-bold' : 'text-[#6b7280] font-medium hover:bg-[#f4f5f7] hover:text-[#111827]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Agency Details
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === 'notifications' ? 'bg-white shadow-sm border border-[#f4f5f7] text-[#111827] font-bold' : 'text-[#6b7280] font-medium hover:bg-[#f4f5f7] hover:text-[#111827]'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === 'appearance' ? 'bg-white shadow-sm border border-[#f4f5f7] text-[#111827] font-bold' : 'text-[#6b7280] font-medium hover:bg-[#f4f5f7] hover:text-[#111827]'
              }`}
            >
              <Paintbrush className="w-4 h-4" />
              Appearance
            </button>
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
            <form onSubmit={handleSave} className="p-6">
              
              {/* Agency Tab */}
              {activeTab === 'agency' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">Agency Details</h3>
                    <p className="text-sm text-[#6b7280] mt-1">Update your agency's public information for invoices and contracts.</p>
                  </div>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#111827]">Agency Name</label>
                      <input 
                        type="text" 
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#111827]">Website</label>
                      <input 
                        type="url" 
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#111827]">Business Address</label>
                      <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full flex min-h-[80px] rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">Notifications</h3>
                    <p className="text-sm text-[#6b7280] mt-1">Choose what updates you want to receive.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-[#f4f5f7]">
                      <div>
                        <p className="font-semibold text-[#111827]">Task Assignments</p>
                        <p className="text-sm text-[#6b7280]">Receive an email when a task is assigned to you.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#e5e7eb] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[#f4f5f7]">
                      <div>
                        <p className="font-semibold text-[#111827]">Contract Signatures</p>
                        <p className="text-sm text-[#6b7280]">Get notified when a client signs a contract.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#e5e7eb] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-semibold text-[#111827]">Invoice Payments</p>
                        <p className="text-sm text-[#6b7280]">Get alerted when an invoice is marked as paid.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#e5e7eb] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">Appearance</h3>
                    <p className="text-sm text-[#6b7280] mt-1">Customize the look and feel of your dashboard.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border-2 border-[#2563eb] rounded-[24px] p-4 cursor-pointer text-center relative bg-[#f4f5f7]">
                      <div className="absolute top-4 right-4 w-3 h-3 bg-[#2563eb] rounded-full"></div>
                      <div className="w-full h-20 bg-white rounded-[16px] mb-3 flex items-center justify-center shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[#f4f5f7]"></div>
                      </div>
                      <p className="font-bold text-sm text-[#111827]">Light Canvas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-[#f4f5f7] flex justify-end">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center"
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
