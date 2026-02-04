'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { MagnifyingGlassIcon, BookOpenIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
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

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchArticles() }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
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

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">All Articles</h1>
        <p className="text-gray-500 text-sm">Browse all articles from your RSS feeds</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
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
          {filteredArticles.map((article) => (
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
                </div>

                <a href={article.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0">
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
