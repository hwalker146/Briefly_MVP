'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusIcon, Bars3Icon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'

interface HeaderProps {
  onMenuClick?: () => void
  title?: string
  showSearch?: boolean
}

export function Header({ onMenuClick, title, showSearch = true }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <div className="sticky top-0 z-40 glass border-b border-gray-100/50">
      <div className="max-w-[1200px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            )}

            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/feeds">
              <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm shadow-indigo-200 hover:shadow-md transition-all">
                <PlusIcon className="w-4 h-4" />
                Add Feed
              </button>
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-gray-600 font-medium">{session.user.name || session.user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all"
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
