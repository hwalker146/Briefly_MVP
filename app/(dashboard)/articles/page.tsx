'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { MagnifyingGlassIcon, FunnelIcon, BookOpenIcon } from '@heroicons/react/24/outline'

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
  }
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchArticles()
  }, [])

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
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="mb-8">
        <h1 className="text-28 font-bold text-gray-900 mb-2">All Articles</h1>
        <p className="text-gray-600">Browse all articles from your RSS feeds</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600">Add some RSS feeds to start receiving articles.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
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
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {article.summary?.content || article.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}