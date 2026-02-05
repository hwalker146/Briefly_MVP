'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  MagnifyingGlassIcon,
  MicrophoneIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface TranscriptSummary {
  id: string
  articleId: string
  title: string
  feedTitle: string
  feedUrl: string
  publishedAt: string
  duration: number | null
  wordCount: number
  speakerCount: number
  segmentCount: number
  chatCount: number
  status: string
  createdAt: string
}

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<TranscriptSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTranscripts()
  }, [])

  const fetchTranscripts = async () => {
    try {
      const response = await fetch('/api/transcripts')
      if (response.ok) {
        const data = await response.json()
        setTranscripts(data.transcripts || [])
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const filteredTranscripts = transcripts.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.feedTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Mock data for display when no real transcripts exist
  const mockTranscripts: TranscriptSummary[] = [
    {
      id: 'mock-1',
      articleId: 'a1',
      title: 'The Future of AI: Interview with Leading Researchers',
      feedTitle: 'Lex Fridman Podcast',
      feedUrl: 'https://lexfridman.com',
      publishedAt: '2025-01-28T10:00:00Z',
      duration: 7200,
      wordCount: 15420,
      speakerCount: 2,
      segmentCount: 342,
      chatCount: 5,
      status: 'READY',
      createdAt: '2025-01-28T14:00:00Z'
    },
    {
      id: 'mock-2',
      articleId: 'a2',
      title: 'Building Products That Users Love',
      feedTitle: 'How I Built This',
      feedUrl: 'https://npr.org',
      publishedAt: '2025-01-27T08:00:00Z',
      duration: 3600,
      wordCount: 8240,
      speakerCount: 3,
      segmentCount: 186,
      chatCount: 2,
      status: 'READY',
      createdAt: '2025-01-27T12:00:00Z'
    },
    {
      id: 'mock-3',
      articleId: 'a3',
      title: 'Deep Dive: Rust Programming Language',
      feedTitle: 'Software Engineering Daily',
      feedUrl: 'https://softwareengineeringdaily.com',
      publishedAt: '2025-01-26T09:30:00Z',
      duration: 5400,
      wordCount: 11800,
      speakerCount: 2,
      segmentCount: 267,
      chatCount: 0,
      status: 'READY',
      createdAt: '2025-01-26T13:00:00Z'
    },
    {
      id: 'mock-4',
      articleId: 'a4',
      title: 'The State of Venture Capital in 2025',
      feedTitle: 'All-In Podcast',
      feedUrl: 'https://allin.com',
      publishedAt: '2025-01-25T11:00:00Z',
      duration: 4800,
      wordCount: 10500,
      speakerCount: 4,
      segmentCount: 215,
      chatCount: 8,
      status: 'READY',
      createdAt: '2025-01-25T15:00:00Z'
    }
  ]

  const displayTranscripts = transcripts.length > 0
    ? filteredTranscripts
    : mockTranscripts.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.feedTitle.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transcripts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse podcast transcripts and ask questions about any episode
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transcripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1.5">
            <DocumentTextIcon className="w-4 h-4 text-gray-400" />
            {displayTranscripts.length} transcripts
          </span>
          <span className="flex items-center gap-1.5">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
            {displayTranscripts.reduce((acc, t) => acc + t.chatCount, 0)} questions asked
          </span>
        </div>
      </div>

      {displayTranscripts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MicrophoneIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No transcripts yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : 'Subscribe to podcast feeds to start getting transcripts of episodes.'}
          </p>
          {!searchQuery && (
            <Link
              href="/feeds"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm shadow-indigo-200 transition-all"
            >
              Add Podcast Feed
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayTranscripts.map((transcript) => (
            <Link
              key={transcript.id}
              href={`/transcripts/${transcript.id}`}
              className="block card-hover bg-white rounded-xl border border-gray-100 shadow-sm p-5 group"
            >
              <div className="flex items-start gap-4">
                {/* Podcast icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-indigo-200 group-hover:to-violet-200 transition-colors">
                  <MicrophoneIcon className="w-6 h-6 text-indigo-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${new URL(transcript.feedUrl).hostname}&sz=16`}
                      alt=""
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-xs font-medium text-gray-500">{transcript.feedTitle}</span>
                    <span className="text-xs text-gray-300">&middot;</span>
                    <span className="text-xs text-gray-400">{formatDate(transcript.publishedAt)}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {transcript.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {transcript.duration && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {formatDuration(transcript.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                      {transcript.wordCount.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="w-3.5 h-3.5" />
                      {transcript.speakerCount} speaker{transcript.speakerCount !== 1 ? 's' : ''}
                    </span>
                    {transcript.chatCount > 0 && (
                      <span className="flex items-center gap-1 text-indigo-600">
                        <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                        {transcript.chatCount} Q&A
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 self-center">
                  <PlayIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
