'use client'

import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  showSearch?: boolean
}

export function AppLayout({ children, title, showSearch = true }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="md:ml-260">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          showSearch={showSearch}
        />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}