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
    try {
      // Mock API call - would generate preview based on current subscriptions
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities',
          summary: 'OpenAI unveiled GPT-5 with unprecedented reasoning capabilities, scoring 92% on mathematical benchmarks compared to GPT-4\'s 76%. The model introduces "chain-of-thought" reasoning for transparency and will be available to developers next month.',
          url: 'https://example.com/article1',
          publishedAt: '2025-01-29T10:00:00Z',
          source: {
            name: 'TechCrunch',
            favicon: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32'
          },
          readTime: 4
        },
        {
          id: '2',
          title: 'Climate Policy Changes Announced for 2025',
          summary: 'Major policy shifts include new carbon pricing mechanisms, renewable energy incentives, and international cooperation frameworks. Key stakeholders praise the comprehensive approach while raising implementation concerns.',
          url: 'https://example.com/article2',
          publishedAt: '2025-01-29T09:30:00Z',
          source: {
            name: 'Reuters',
            favicon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=32'
          },
          readTime: 6
        },
        {
          id: '3',
          title: 'SpaceX Launches New Satellite Constellation for Global Internet',
          summary: 'The latest Starlink mission deployed 60 satellites, expanding global coverage to remote regions. The launch marks a significant milestone in making internet access universal.',
          url: 'https://example.com/article3',
          publishedAt: '2025-01-29T08:45:00Z',
          source: {
            name: 'Ars Technica',
            favicon: 'https://www.google.com/s2/favicons?domain=arstechnica.com&sz=32'
          },
          readTime: 3
        },
        {
          id: '4',
          title: 'Apple Announces New MacBook Pro with M3 Chip',
          summary: 'The new MacBook Pro features Apple\'s latest M3 chip with 30% better performance and improved battery life. Prices start at $1,999 with availability in February.',
          url: 'https://example.com/article4',
          publishedAt: '2025-01-29T07:20:00Z',
          source: {
            name: 'The Verge',
            favicon: 'https://www.google.com/s2/favicons?domain=theverge.com&sz=32'
          },
          readTime: 2
        }
      ]

      setDigestData({
        date: new Date().toISOString(),
        articles: mockArticles,
        totalArticles: mockArticles.length,
        readTime: mockArticles.reduce((acc, article) => acc + article.readTime, 0)
      })
    } catch (error) {
      console.error('Error fetching digest preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    setSending(true)
    try {
      // Mock API call to send test email
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Test email sent successfully!')
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('Failed to send test email. Please try again.')
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
              <h1 className="text-28 font-bold text-gray-900">Digest Preview</h1>
              <p className="text-gray-600 mt-1">
                Preview how your digest will look when delivered
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button
                onClick={fetchDigestPreview}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
              
              <button
                onClick={handleSendTestEmail}
                disabled={sending}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-md transition-colors"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                )}
                Send Test Email
              </button>
            </div>
          </div>

          {/* Digest Info */}
          {digestData && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mb-6">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(digestData.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{digestData.totalArticles} articles</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{digestData.readTime} min read</span>
                </div>
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-1 w-fit">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <EyeIcon className="w-4 h-4 mr-2 inline" />
              Web Preview
            </button>
            <button
              onClick={() => setViewMode('email')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'email' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <EnvelopeIcon className="w-4 h-4 mr-2 inline" />
              Email Template
            </button>
          </div>
        </div>

        {/* Content */}
        {digestData ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            {viewMode === 'preview' ? (
              <DigestPreview digestData={digestData} />
            ) : (
              <EmailTemplate digestData={digestData} />
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No digest data</h3>
            <p className="text-gray-600 mb-4">
              Unable to generate digest preview. Please check your subscriptions.
            </p>
            <button
              onClick={fetchDigestPreview}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
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