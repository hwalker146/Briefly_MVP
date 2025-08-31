'use client'

import { useState } from 'react'
import { EllipsisHorizontalIcon, RssIcon, ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline'

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
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img 
              src={`https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl || feed.url).hostname}&sz=32`}
              alt=""
              className="w-8 h-8 rounded flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  <button
                    onClick={() => onViewFeed(feed.id)}
                    className="hover:text-indigo-600 text-left"
                  >
                    {feed.title}
                  </button>
                </h3>
                
                {feed.fetchStatus === 'error' && (
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-13 text-gray-600">
                <span>Last updated {formatTimeAgo(feed.lastFetched)}</span>
                {feed.latestHeadline && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-xs">{feed.latestHeadline}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {feed.unreadCount > 0 && (
              <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-13 font-medium">
                {feed.unreadCount} unread
              </div>
            )}
            
            <button
              onClick={handleSubscribeClick}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                feed.isSubscribed
                  ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : feed.isSubscribed ? (
                <>
                  <CheckIcon className="w-4 h-4 inline mr-1" />
                  Subscribed
                </>
              ) : (
                'Subscribe'
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      onViewFeed(feed.id)
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    View feed
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(feed.url)
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Copy feed URL
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Report problem
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <img 
          src={`https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl || feed.url).hostname}&sz=32`}
          alt=""
          className="w-8 h-8 rounded"
        />
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  onViewFeed(feed.id)
                  setShowMenu(false)
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View feed
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(feed.url)
                  setShowMenu(false)
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Copy URL
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2">
        <button
          onClick={() => onViewFeed(feed.id)}
          className="hover:text-indigo-600 text-left"
        >
          {feed.title}
        </button>
      </h3>
      
      {feed.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {feed.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-13 text-gray-600">
          <span>{formatTimeAgo(feed.lastFetched)}</span>
          {feed.fetchStatus === 'error' && (
            <>
              <span>•</span>
              <span className="text-red-600">Fetch failed</span>
            </>
          )}
        </div>
        
        {feed.unreadCount > 0 && (
          <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-13 font-medium">
            {feed.unreadCount}
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={handleSubscribeClick}
          disabled={isLoading}
          className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            feed.isSubscribed
              ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
              : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            </div>
          ) : feed.isSubscribed ? (
            <>
              <CheckIcon className="w-4 h-4 inline mr-1" />
              Subscribed
            </>
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
    </div>
  )
}