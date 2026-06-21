import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f5f7] text-[#111827] font-sans tracking-tight selection:bg-[#2563eb]/20 selection:text-[#2563eb]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden px-4 pb-4 gap-4 lg:px-6 lg:pb-6 lg:gap-6">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
