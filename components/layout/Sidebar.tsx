'use client'

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
  EnvelopeIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Feeds', href: '/feeds', icon: RssIcon },
  { name: 'Articles', href: '/articles', icon: BookmarkIcon },
  { name: 'Transcripts', href: '/transcripts', icon: MicrophoneIcon },
  { name: 'Prompts', href: '/prompts', icon: SparklesIcon },
  { name: 'Digest', href: '/digest', icon: EnvelopeIcon },
  { name: 'Preferences', href: '/preferences', icon: Cog6ToothIcon },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80">
        <Link href="/dashboard" className="flex items-center group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:shadow-md transition-shadow">
            <RssIcon className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">Briefly</span>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Add Feed */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/feeds">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm shadow-indigo-200 hover:shadow-md transition-all">
            <PlusIcon className="w-4 h-4" />
            Add Feed
          </button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-1">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Next Digest Card */}
      <div className="px-5 pb-3">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100/50">
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 mb-1">
            <ClockIcon className="w-3.5 h-3.5" />
            Next digest
          </div>
          <div className="text-sm font-semibold text-gray-900 mb-1">
            Tomorrow at 8:00 AM
          </div>
          <Link
            href="/preferences"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Edit schedule
          </Link>
        </div>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="px-5 py-4 border-t border-gray-100/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-indigo-600">
                {session.user.name?.[0] || session.user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {session.user.name || 'User'}
              </div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (onClose) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 left-0 w-[260px] bg-white shadow-2xl">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-100/80">
      {sidebarContent}
    </div>
  )
}
