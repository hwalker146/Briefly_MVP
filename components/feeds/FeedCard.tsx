'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EllipsisHorizontalIcon, ExclamationTriangleIcon, CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline'

interface Feed {
  id: string
  title: string
  description?: string
  url: string
  siteUrl?: string
  lastFetched?: string
  lastPublished?: string
  latestHeadline?: string
  unreadCount: number
  isSubscribed: boolean
  fetchStatus: 'success' | 'error' | 'pending'
}

interface FeedCardProps {
  feed: Feed
  viewMode: 'grid' | 'list'
  onSubscribe: (feedId: string) => void
  onUnsubscribe: (feedId: string) => void
  onViewFeed: (feedId: string) => void
}

export function FeedCard({ feed, viewMode, onSubscribe, onUnsubscribe, onViewFeed }: FeedCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubscribeClick = async () => {
    setIsLoading(true)
    try {
      if (feed.isSubscribed) {
        await onUnsubscribe(feed.id)
      } else {
        await onSubscribe(feed.id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(feed.url)
    setCopied(true)
    setShowMenu(false)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (viewMode === 'list') {
    return (
      <div className="card-hover bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl || feed.url).hostname}&sz=32`}
              alt=""
              className="w-8 h-8 rounded-lg flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-gray-900 truncate">
                  <Link href="/articles" className="hover:text-indigo-600 transition-colors">
                    {feed.title}
                  </Link>
                </h3>
                {feed.fetchStatus === 'error' && (
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Updated {formatTimeAgo(feed.lastFetched)}</span>
                {feed.latestHeadline && (
                  <>
                    <span>&middot;</span>
                    <span className="truncate max-w-xs text-gray-500">{feed.latestHeadline}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {feed.unreadCount > 0 && (
              <div className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                {feed.unreadCount} unread
              </div>
            )}

            <button
              onClick={handleSubscribeClick}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                feed.isSubscribed
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
              ) : feed.isSubscribed ? (
                <span className="flex items-center gap-1">
                  <CheckIcon className="w-4 h-4" />
                  Subscribed
                </span>
              ) : (
                'Subscribe'
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                    <Link
                      href="/articles"
                      onClick={() => setShowMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View articles
                    </Link>
                    <button
                      onClick={handleCopyUrl}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {copied ? 'Copied!' : 'Copy feed URL'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="card-hover bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <img
          src={`https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl || feed.url).hostname}&sz=32`}
          alt=""
          className="w-8 h-8 rounded-lg"
        />

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                <Link
                  href="/articles"
                  onClick={() => setShowMenu(false)}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  View articles
                </Link>
                <button
                  onClick={handleCopyUrl}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1.5">
        <Link href="/articles" className="hover:text-indigo-600 transition-colors">
          {feed.title}
        </Link>
      </h3>

      {feed.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{feed.description}</p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{formatTimeAgo(feed.lastFetched)}</span>
          {feed.fetchStatus === 'error' && (
            <>
              <span>&middot;</span>
              <span className="text-amber-500">Fetch failed</span>
            </>
          )}
        </div>

        {feed.unreadCount > 0 && (
          <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-xs font-semibold">
            {feed.unreadCount}
          </div>
        )}
      </div>

      <button
        onClick={handleSubscribeClick}
        disabled={isLoading}
        className={`w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
          feed.isSubscribed
            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
          </div>
        ) : feed.isSubscribed ? (
          <span className="flex items-center justify-center gap-1">
            <CheckIcon className="w-4 h-4" />
            Subscribed
          </span>
        ) : (
          'Subscribe'
        )}
      </button>
    </div>
  )
}
