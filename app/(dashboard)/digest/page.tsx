'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DigestPreview } from '@/components/digest/DigestPreview'
import { EmailTemplate } from '@/components/digest/EmailTemplate'
import {
  EyeIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface Article {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: string
  source: {
    name: string
    favicon: string
  }
  readTime: number
}

interface DigestData {
  date: string
  articles: Article[]
  totalArticles: number
  readTime: number
}

export default function DigestPage() {
  const [digestData, setDigestData] = useState<DigestData | null>(null)
  const [viewMode, setViewMode] = useState<'preview' | 'email'>('preview')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchDigestPreview()
  }, [])

  const fetchDigestPreview = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/digest/preview')
      if (!response.ok) {
        throw new Error('Failed to fetch digest preview')
      }

      const data = await response.json()

      // Helper to extract domain from URL for favicon
      const getFavicon = (url: string) => {
        try {
          const domain = new URL(url).hostname
          return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
        } catch {
          return 'https://www.google.com/s2/favicons?domain=example.com&sz=32'
        }
      }

      // Estimate read time (~200 words per minute)
      const estimateReadTime = (text: string) => {
        const words = text.split(/\s+/).length
        return Math.max(1, Math.ceil(words / 200))
      }

      // Map API response to component format
      const mappedArticles: Article[] = (data.articles || []).map((article: {
        id: string
        title: string
        description?: string
        url: string
        publishedAt: string
        feed: { title: string; url?: string }
        summary?: { content: string }
      }) => {
        const summaryText = article.summary?.content || article.description || 'No summary available'
        return {
          id: article.id,
          title: article.title,
          summary: summaryText,
          url: article.url,
          publishedAt: article.publishedAt,
          source: {
            name: article.feed.title,
            favicon: getFavicon(article.feed.url || article.url)
          },
          readTime: estimateReadTime(summaryText)
        }
      })

      const totalReadTime = mappedArticles.reduce((acc, article) => acc + article.readTime, 0)

      setDigestData({
        date: data.stats?.lastUpdated || new Date().toISOString(),
        articles: mappedArticles,
        totalArticles: mappedArticles.length,
        readTime: totalReadTime
      })
    } catch (error) {
      console.error('Error fetching digest preview:', error)
      setDigestData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/digest/send-test', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }

      alert(`Test email sent successfully! ${data.articlesIncluded} articles included.`)
    } catch (error) {
      console.error('Error sending test email:', error)
      alert(error instanceof Error ? error.message : 'Failed to send test email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
      <div className="max-w-6xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Digest Preview</h1>
              <p className="text-sm text-gray-500 mt-1">
                Preview how your digest will look when delivered
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button
                onClick={fetchDigestPreview}
                disabled={loading}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>

              <button
                onClick={handleSendTestEmail}
                disabled={sending}
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 rounded-xl transition-all shadow-sm"
              >
                {sending ? (
                  <div className="w-4 h-4 border-[3px] border-indigo-100 border-t-white rounded-full animate-spin mr-2"></div>
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                )}
                Send Test Email
              </button>
            </div>
          </div>

          {/* Digest Info */}
          {digestData && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span>{formatDate(digestData.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                    <EnvelopeIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span>{digestData.totalArticles} articles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span>{digestData.readTime} min read</span>
                </div>
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Web Preview
            </button>
            <button
              onClick={() => setViewMode('email')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                viewMode === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Email Template
            </button>
          </div>
        </div>

        {/* Content */}
        {digestData ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {viewMode === 'preview' ? (
              <DigestPreview digestData={digestData} />
            ) : (
              <EmailTemplate digestData={digestData} />
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No digest data</h3>
            <p className="text-sm text-gray-500 mb-6">
              Unable to generate digest preview. Please check your subscriptions.
            </p>
            <button
              onClick={fetchDigestPreview}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
