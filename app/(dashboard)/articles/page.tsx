'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { MagnifyingGlassIcon, BookOpenIcon, ArrowTopRightOnSquareIcon, CheckIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  feed: { title: string; url: string }
  summary?: { content: string }
}

interface ArticleState {
  isRead: boolean
  readAt: string | null
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [articleStates, setArticleStates] = useState<Record<string, ArticleState>>({})
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    fetchArticles()
    fetchBookmarks()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (response.ok) {
        const data = await response.json()
        const articlesData = data.articles || []
        setArticles(articlesData)

        // Fetch read states for these articles
        if (articlesData.length > 0) {
          const ids = articlesData.map((a: Article) => a.id).join(',')
          const statesResponse = await fetch(`/api/article-state?ids=${ids}`)
          if (statesResponse.ok) {
            const statesData = await statesResponse.json()
            setArticleStates(statesData.states || {})
          }
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const data = await response.json()
        const ids = new Set((data.bookmarks || []).map((bm: { article: { id: string } }) => bm.article.id))
        setBookmarkedIds(ids as Set<string>)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const handleToggleRead = async (articleId: string) => {
    const currentState = articleStates[articleId]
    const newIsRead = !currentState?.isRead

    // Optimistic update
    setArticleStates(prev => ({
      ...prev,
      [articleId]: { isRead: newIsRead, readAt: newIsRead ? new Date().toISOString() : null }
    }))

    try {
      await fetch('/api/article-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, isRead: newIsRead })
      })
    } catch (error) {
      // Revert on error
      setArticleStates(prev => ({
        ...prev,
        [articleId]: currentState || { isRead: false, readAt: null }
      }))
    }
  }

  const handleMarkAsRead = async (articleId: string) => {
    if (articleStates[articleId]?.isRead) return

    setArticleStates(prev => ({
      ...prev,
      [articleId]: { isRead: true, readAt: new Date().toISOString() }
    }))

    try {
      await fetch('/api/article-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, isRead: true })
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleToggleBookmark = async (articleId: string) => {
    const isBookmarked = bookmarkedIds.has(articleId)

    // Optimistic update
    setBookmarkedIds(prev => {
      const newSet = new Set(prev)
      if (isBookmarked) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })

    try {
      await fetch('/api/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      })
    } catch (error) {
      // Revert on error
      setBookmarkedIds(prev => {
        const newSet = new Set(prev)
        if (isBookmarked) {
          newSet.add(articleId)
        } else {
          newSet.delete(articleId)
        }
        return newSet
      })
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = filteredArticles
      .filter(a => !articleStates[a.id]?.isRead)
      .map(a => a.id)

    if (unreadIds.length === 0) return

    // Optimistic update
    const now = new Date().toISOString()
    setArticleStates(prev => {
      const newStates = { ...prev }
      unreadIds.forEach(id => {
        newStates[id] = { isRead: true, readAt: now }
      })
      return newStates
    })

    try {
      await fetch('/api/article-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: unreadIds, isRead: true })
      })
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const isRead = articleStates[article.id]?.isRead
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !isRead) ||
      (filter === 'read' && isRead)

    return matchesSearch && matchesFilter
  })

  const unreadCount = articles.filter(a => !articleStates[a.id]?.isRead).length

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">All Articles</h1>
            <p className="text-gray-500 text-sm">Browse all articles from your RSS feeds</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              Mark all read ({unreadCount})
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpenIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search terms.' : 'Add some RSS feeds to start receiving articles.'}
          </p>
          {!searchQuery && (
            <Link
              href="/feeds"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm shadow-indigo-200 transition-all"
            >
              Add Feed
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => {
            const isRead = articleStates[article.id]?.isRead
            const isBookmarked = bookmarkedIds.has(article.id)

            return (
              <div
                key={article.id}
                className={`card-hover bg-white rounded-xl border shadow-sm p-5 transition-all ${
                  isRead ? 'border-gray-100 opacity-75' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {isRead ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(article.feed.url).hostname}&sz=16`}
                        alt=""
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs font-medium text-gray-500">{article.feed.title}</span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-400">{formatTimeAgo(article.publishedAt)}</span>
                    </div>

                    <h3 className={`font-semibold mb-1.5 leading-snug ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600 transition-colors"
                        onClick={() => handleMarkAsRead(article.id)}
                      >
                        {article.title}
                      </a>
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      {article.summary?.content || article.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleRead(article.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isRead
                          ? 'text-green-500 hover:text-gray-400 hover:bg-gray-50'
                          : 'text-gray-300 hover:text-green-500 hover:bg-green-50'
                      }`}
                      title={isRead ? 'Mark as unread' : 'Mark as read'}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(article.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'text-indigo-500 hover:text-gray-400 hover:bg-gray-50'
                          : 'text-gray-300 hover:text-indigo-500 hover:bg-indigo-50'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      {isBookmarked ? (
                        <BookmarkSolidIcon className="w-4 h-4" />
                      ) : (
                        <BookmarkIcon className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      onClick={() => handleMarkAsRead(article.id)}
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
