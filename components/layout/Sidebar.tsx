'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  HomeIcon, 
  RssIcon, 
  BookmarkIcon,
  SparklesIcon,
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Feeds', href: '/feeds', icon: RssIcon },
  { name: 'Subscriptions', href: '/subscriptions', icon: BookmarkIcon },
  { name: 'Prompts', href: '/prompts', icon: SparklesIcon },
  { name: 'Digest Preview', href: '/digest', icon: EnvelopeIcon },
  { name: 'Preferences', href: '/preferences', icon: Cog6ToothIcon },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <RssIcon className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">Briefly</span>
        </Link>
        
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Add Feed */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/feeds">
          <button className="w-full flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Feed
          </button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Scheduled Next Send Card */}
      <div className="p-6 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center text-13 text-gray-600 mb-1">
            <ClockIcon className="w-4 h-4 mr-2" />
            Next digest
          </div>
          <div className="text-sm font-medium text-gray-900">
            Tomorrow at 8:00 AM
          </div>
          <Link 
            href="/preferences"
            className="text-13 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Edit schedule
          </Link>
        </div>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {session.user.name?.[0] || session.user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {session.user.name || 'User'}
              </div>
              <div className="text-13 text-gray-600">Free Plan</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (onClose) {
    // Mobile sidebar overlay
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden md:flex md:w-260 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-100">
      {sidebarContent}
    </div>
  )
}