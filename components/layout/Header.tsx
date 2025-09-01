'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, UserCircleIcon, PlusIcon, QuestionMarkCircleIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'

interface HeaderProps {
  onMenuClick?: () => void
  title?: string
  showSearch?: boolean
}

export function Header({ onMenuClick, title, showSearch = true }: HeaderProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-1200 mx-auto px-6 py-3">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            )}
            
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/feeds">
              <button className="hidden md:inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Feed
              </button>
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{session.user.name || session.user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}