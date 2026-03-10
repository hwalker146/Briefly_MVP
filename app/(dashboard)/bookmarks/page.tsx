'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import Link from 'next/link'
import {
  BookmarkIcon,
  BookmarkSlashIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

interface Bookmark {
  id: string
  notes: string | null
  createdAt: string
  article: {
    id: string
    title: string
    description: string
    url: string
    publishedAt: string
    feed: { title: string; siteUrl: string | null }
  }
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data.bookmarks || [])
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (articleId: string) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      })

      if (response.ok) {
        setBookmarks(prev => prev.filter(bm => bm.article.id !== articleId))
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const filteredBookmarks = bookmarks.filter(bm =>
    bm.article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bm.article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bm.article.feed.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
            <p className="text-sm text-gray-500 mt-1">
              Articles you&apos;ve saved for later
            </p>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookmarkIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Save articles you want to read later by clicking the bookmark icon on any article.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm transition-all"
          >
            Browse Articles
          </Link>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No bookmarks match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <BookmarkSolidIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium text-gray-500">
                      {bookmark.article.feed.title}
                    </span>
                    <span className="text-xs text-gray-300">&middot;</span>
                    <span className="text-xs text-gray-400">
                      Saved {formatTimeAgo(bookmark.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1.5 leading-snug">
                    <a
                      href={bookmark.article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {bookmark.article.title}
                    </a>
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {bookmark.article.description}
                  </p>

                  <div className="mt-2 text-xs text-gray-400">
                    Published {formatDate(bookmark.article.publishedAt)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={bookmark.article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Open article"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.article.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove bookmark"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
