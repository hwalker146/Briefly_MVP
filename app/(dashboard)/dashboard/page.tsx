'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PlusIcon, ClockIcon, BookOpenIcon, EyeIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  feed: {
    title: string
    url: string
  }
  summary?: {
    content: string
    prompt?: {
      title: string
    }
  }
}

interface FeedSource {
  id: string
  title: string
  url: string
  description: string
  unreadCount: number
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [topSources, setTopSources] = useState<FeedSource[]>([])
  const [loading, setLoading] = useState(true)
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [addingFeed, setAddingFeed] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
        window.location.href = '/feeds' // Redirect to feeds page
      } else {
        const errorData = await response.json()
        alert(`Failed to add feed: ${errorData.details || errorData.error}`)
      }
    } catch (error) {
      alert('Error adding feed. Please try again.')
    } finally {
      setAddingFeed(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
        setTopSources(data.topSources || [])
      } else {
        // No data yet - show empty state
        setArticles([])
        setTopSources([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setArticles([])
      setTopSources([])
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
            <h1 className="text-28 font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Next send: <span className="font-medium text-gray-900">Tomorrow at 8:00 AM</span> (in 18 hours)
            </p>
          </div>
          <Link
            href="/digest/preview"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Preview Digest
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Unread Articles */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Unread Articles</h2>
              <span className="text-13 text-gray-600">{articles.length} new</span>
            </div>
            
            {articles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No new articles</h3>
                <p className="text-gray-600 mb-4">Add some RSS feeds to start receiving article summaries.</p>
                <Link
                  href="/feeds"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Feed
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${new URL(article.feed.url).hostname}&sz=16`}
                            alt=""
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-13 font-medium text-gray-700">{article.feed.title}</span>
                          <span className="text-13 text-gray-500">•</span>
                          <span className="text-13 text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                            {article.title}
                          </a>
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {article.summary?.content || article.description}
                        </p>
                        
                        {article.summary?.prompt && (
                          <div className="inline-flex items-center px-2 py-1 text-13 bg-indigo-100 text-indigo-700 rounded-full">
                            {article.summary.prompt.title}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50">
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {articles.length > 0 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/articles"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all articles →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Top Sources */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Sources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topSources.map((source) => (
                <div key={source.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=24`}
                        alt=""
                        className="w-6 h-6 rounded"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{source.title}</h3>
                        <p className="text-13 text-gray-600">Last updated 2h ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{source.unreadCount}</div>
                      <div className="text-13 text-gray-600">unread</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Add Feed */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Feed</h3>
            <form onSubmit={handleAddFeed} className="space-y-3">
              <input
                type="url"
                placeholder="Paste an RSS link or website URL"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={addingFeed || !newFeedUrl.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-md transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {addingFeed ? 'Adding...' : 'Add Feed'}
              </button>
            </form>
          </section>

          {/* My Prompts */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Prompts</h3>
              <Link href="/prompts" className="text-13 text-indigo-600 hover:text-indigo-700 font-medium">
                View all
              </Link>
            </div>
            
            <div className="space-y-2">
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <h4 className="font-medium text-gray-900 text-sm">Tech News Brief</h4>
                <p className="text-13 text-gray-600 mt-1">Concise tech summaries with key insights</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <h4 className="font-medium text-gray-900 text-sm">Policy Analysis</h4>
                <p className="text-13 text-gray-600 mt-1">Focus on implications and stakeholders</p>
              </div>
              <Link
                href="/prompts/new"
                className="block text-center py-2 text-13 text-indigo-600 hover:text-indigo-700 font-medium border border-dashed border-gray-300 rounded-lg hover:border-indigo-300 transition-colors"
              >
                + Create Prompt
              </Link>
            </div>
          </section>

          {/* Email Schedule */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Schedule</h3>
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center text-sm text-indigo-700 mb-2">
                <ClockIcon className="w-4 h-4 mr-2" />
                Daily digest
              </div>
              <div className="font-medium text-indigo-900 mb-3">
                Tomorrow at 8:00 AM EST
              </div>
              <Link 
                href="/preferences"
                className="text-13 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Edit schedule →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}