'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PlusIcon, ClockIcon, BookOpenIcon, EyeIcon, ArrowTopRightOnSquareIcon, SparklesIcon, BookmarkIcon, FolderIcon, RssIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  feed: { title: string; url: string }
  summary?: { content: string; prompt?: { title: string } }
}

interface FeedSource {
  id: string
  title: string
  url: string
  description: string
  unreadCount: number
}

interface Bookmark {
  id: string
  createdAt: string
  article: {
    id: string
    title: string
    url: string
    feed: { title: string }
  }
}

interface Category {
  id: string
  name: string
  color: string
  feedCount: number
}

interface Stats {
  totalFeeds: number
  totalArticles: number
  unreadCount: number
  bookmarkCount: number
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [topSources, setTopSources] = useState<FeedSource[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats>({ totalFeeds: 0, totalArticles: 0, unreadCount: 0, bookmarkCount: 0 })
  const [loading, setLoading] = useState(true)
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [addingFeed, setAddingFeed] = useState(false)

  useEffect(() => { fetchDashboardData() }, [])

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFeedUrl.trim()) return
    setAddingFeed(true)
    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newFeedUrl.trim() })
      })
      if (response.ok) {
        setNewFeedUrl('')
        window.location.href = '/feeds'
      } else {
        const errorData = await response.json()
        alert(`Failed to add feed: ${errorData.details || errorData.error}`)
      }
    } catch {
      alert('Error adding feed. Please try again.')
    } finally {
      setAddingFeed(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, bookmarksRes, categoriesRes, articleStatesRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/bookmarks'),
        fetch('/api/categories'),
        fetch('/api/article-state')
      ])

      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setArticles(data.articles || [])
        setTopSources(data.topSources || [])
        setStats(prev => ({
          ...prev,
          totalFeeds: data.topSources?.length || 0,
          totalArticles: data.articles?.length || 0
        }))
      }

      if (bookmarksRes.ok) {
        const data = await bookmarksRes.json()
        setBookmarks((data.bookmarks || []).slice(0, 5))
        setStats(prev => ({ ...prev, bookmarkCount: (data.bookmarks || []).length }))
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories || [])
      }

      if (articleStatesRes.ok) {
        const data = await articleStatesRes.json()
        const readCount = Object.values(data.states || {}).filter((s: unknown) => (s as { isRead: boolean }).isRead).length
        setStats(prev => ({ ...prev, unreadCount: prev.totalArticles - readCount }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Next digest: <span className="font-medium text-gray-700">Tomorrow at 8:00 AM</span>
            </p>
          </div>
          <Link
            href="/digest"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
            Preview Digest
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.unreadCount || articles.length}</div>
                <div className="text-xs text-gray-500">Unread</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <RssIcon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{topSources.length}</div>
                <div className="text-xs text-gray-500">Feeds</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <BookmarkIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.bookmarkCount}</div>
                <div className="text-xs text-gray-500">Bookmarks</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FolderIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Unread Articles */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Unread Articles</h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{articles.length} new</span>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <BookOpenIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No new articles</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Add some RSS feeds to start receiving article summaries.</p>
                <Link
                  href="/feeds"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm shadow-indigo-200 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Feed
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <div key={article.id} className="card-hover bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(article.feed.url).hostname}&sz=16`}
                            alt=""
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-xs font-medium text-gray-500">{article.feed.title}</span>
                          <span className="text-xs text-gray-300">&middot;</span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(article.publishedAt)}</span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1.5 leading-snug">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                            {article.title}
                          </a>
                        </h3>

                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                          {article.summary?.content || article.description}
                        </p>

                        {article.summary?.prompt && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 text-xs bg-indigo-50 text-indigo-600 rounded-md font-medium">
                            <SparklesIcon className="w-3 h-3" />
                            {article.summary.prompt.title}
                          </div>
                        )}
                      </div>

                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0">
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}

                <div className="text-center pt-2">
                  <Link href="/articles" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View all articles &rarr;
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Top Sources */}
          {topSources.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Top Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topSources.map((source) => (
                  <div key={source.id} className="card-hover bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=24`}
                          alt=""
                          className="w-6 h-6 rounded"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{source.title}</h3>
                          <p className="text-xs text-gray-400">Last updated 2h ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{source.unreadCount}</div>
                        <div className="text-xs text-gray-400">unread</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Add Feed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Add Feed</h3>
            <form onSubmit={handleAddFeed} className="space-y-3">
              <input
                type="url"
                placeholder="Paste an RSS or website URL"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={addingFeed || !newFeedUrl.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 rounded-xl shadow-sm transition-all"
              >
                <PlusIcon className="w-4 h-4" />
                {addingFeed ? 'Adding...' : 'Add Feed'}
              </button>
            </form>
          </div>

          {/* Recent Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Recent Bookmarks</h3>
                <Link href="/bookmarks" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
              </div>
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map((bm) => (
                  <a
                    key={bm.id}
                    href={bm.article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{bm.article.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{bm.article.feed.title}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
                <Link href="/categories" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Manage</Link>
              </div>
              <div className="space-y-2">
                {categories.slice(0, 5).map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{cat.feedCount} feeds</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Prompts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">My Prompts</h3>
              <Link href="/prompts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <h4 className="font-medium text-gray-900 text-sm">Tech News Brief</h4>
                <p className="text-xs text-gray-500 mt-0.5">Concise tech summaries with key insights</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <h4 className="font-medium text-gray-900 text-sm">Policy Analysis</h4>
                <p className="text-xs text-gray-500 mt-0.5">Focus on implications and stakeholders</p>
              </div>
              <Link
                href="/prompts"
                className="block text-center py-2.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium border border-dashed border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
              >
                + Create Prompt
              </Link>
            </div>
          </div>

          {/* Email Schedule */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
            <div className="flex items-center gap-2 text-sm text-indigo-700 font-medium mb-2">
              <ClockIcon className="w-4 h-4" />
              Daily digest
            </div>
            <div className="font-semibold text-gray-900 mb-3">
              Tomorrow at 8:00 AM EST
            </div>
            <Link
              href="/preferences"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Edit schedule &rarr;
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
