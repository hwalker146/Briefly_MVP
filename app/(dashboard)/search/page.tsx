'use client'

import { useState, useCallback } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  RssIcon,
  MicrophoneIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'

interface ArticleResult {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  feed: { title: string; siteUrl: string }
  type: 'article'
}

interface FeedResult {
  id: string
  title: string
  description: string
  url: string
  siteUrl: string
  type: 'feed'
}

interface TranscriptResult {
  id: string
  articleId: string
  articleTitle: string
  feedTitle: string
  wordCount: number
  duration: number
  matchingSegments: { text: string; startTime: number }[]
  type: 'transcript'
}

interface SearchResults {
  articles: ArticleResult[]
  feeds: FeedResult[]
  transcripts: TranscriptResult[]
}

type SearchType = 'all' | 'articles' | 'feeds' | 'transcripts'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return

    setLoading(true)
    setSearched(true)

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        type: searchType,
        limit: '50'
      })

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [query, searchType])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalResults = results
    ? results.articles.length + results.feeds.length + results.transcripts.length
    : 0

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Search</h1>
        <p className="text-sm text-gray-500">
          Search across articles, feeds, and transcripts
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for articles, feeds, or transcripts..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || query.trim().length < 2}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 rounded-xl shadow-sm transition-all"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          {(['all', 'articles', 'feeds', 'transcripts'] as SearchType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                searchType === type
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : searched && results ? (
        <div className="space-y-6">
          {totalResults === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for &quot;{query}&quot;
              </p>

              {/* Articles */}
              {results.articles.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    Articles ({results.articles.length})
                  </h2>
                  <div className="space-y-3">
                    {results.articles.map((article) => (
                      <div
                        key={article.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500">
                                {article.feed.title}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(article.publishedAt)}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-indigo-600 transition-colors"
                              >
                                {article.title}
                              </a>
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {article.description}
                            </p>
                          </div>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feeds */}
              {results.feeds.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <RssIcon className="w-4 h-4" />
                    Feeds ({results.feeds.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.feeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(feed.url).hostname}&sz=32`}
                            alt=""
                            className="w-8 h-8 rounded-lg"
                          />
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {feed.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {feed.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcripts */}
              {results.transcripts.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MicrophoneIcon className="w-4 h-4" />
                    Transcripts ({results.transcripts.length})
                  </h2>
                  <div className="space-y-3">
                    {results.transcripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            {transcript.feedTitle}
                          </span>
                          {transcript.duration > 0 && (
                            <>
                              <span className="text-xs text-gray-300">&middot;</span>
                              <span className="text-xs text-gray-400">
                                {formatDuration(transcript.duration)}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          {transcript.articleTitle}
                        </h3>
                        {transcript.matchingSegments.length > 0 && (
                          <div className="space-y-2">
                            {transcript.matchingSegments.map((segment, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 border-l-2 border-indigo-400"
                              >
                                <span className="text-xs text-indigo-500 font-medium mr-2">
                                  {formatDuration(segment.startTime)}
                                </span>
                                &quot;{segment.text}...&quot;
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Enter at least 2 characters to search across your articles, feeds, and podcast transcripts.
          </p>
        </div>
      )}
    </PageContainer>
  )
}
