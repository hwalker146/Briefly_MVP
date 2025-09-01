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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-1200 mx-auto px-6 py-3">
        <div className="flex items-center justify-between h-10">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                aria-label="Open menu"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            )}
            
            {title && (
              <div>
                <h1 className="text-28 font-bold text-gray-900">{title}</h1>
              </div>
            )}
          </div>

          {/* Center - Search */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search summaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/feeds">
              <button className="hidden md:inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Feed
              </button>
            </Link>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <QuestionMarkCircleIcon className="w-5 h-5" />
            </button>

            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="hidden md:block text-sm font-medium">
                    {session.user.name || session.user.email}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm text-gray-900 font-medium">{session.user.name}</p>
                      <p className="text-13 text-gray-600">{session.user.email}</p>
                    </div>
                    <Link href="/preferences" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Preferences
                    </Link>
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Account
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}