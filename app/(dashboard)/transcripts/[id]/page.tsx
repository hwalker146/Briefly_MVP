'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ArrowTopRightOnSquareIcon,
  MicrophoneIcon,
  XMarkIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'

interface Segment {
  id: string
  segmentIndex: number
  speaker: string | null
  text: string
  startTime: number
  endTime: number
}

interface Citation {
  segmentIndex: number
  text: string
  startTime: number
  endTime: number
  speaker?: string
}

interface ChatMessage {
  id: string
  question: string
  answer: string
  citations: Citation[]
  createdAt: string
}

interface TranscriptData {
  id: string
  articleId: string
  title: string
  articleUrl: string
  feedTitle: string
  feedUrl: string
  publishedAt: string
  duration: number | null
  wordCount: number
  speakerCount: number
  language: string
  fullText: string
  status: string
  segments: Segment[]
  chats: ChatMessage[]
}


function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'Unknown'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// Speaker color map
const SPEAKER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  default: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
}
const COLOR_LIST = [
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
]

function getSpeakerColor(speaker: string | null, index: number) {
  if (!speaker) return SPEAKER_COLORS.default
  return COLOR_LIST[index % COLOR_LIST.length]
}

export default function TranscriptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const transcriptId = params.id as string

  const [transcript, setTranscript] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedSegments, setHighlightedSegments] = useState<Set<number>>(new Set())
  const [showChat, setShowChat] = useState(true)
  const [question, setQuestion] = useState('')
  const [askingQuestion, setAskingQuestion] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const segmentRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    fetchTranscript()
  }, [transcriptId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const fetchTranscript = async () => {
    try {
      const response = await fetch(`/api/transcripts/${transcriptId}`)
      if (response.ok) {
        const data = await response.json()
        setTranscript(data)
        setChatHistory(data.chats || [])
      } else {
        setTranscript(null)
      }
    } catch (error) {
      console.error('Error fetching transcript:', error)
      setTranscript(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAskQuestion = async () => {
    if (!question.trim() || askingQuestion) return

    const currentQuestion = question.trim()
    setQuestion('')
    setAskingQuestion(true)

    // Add optimistic question to chat
    const tempChat: ChatMessage = {
      id: 'temp-' + Date.now(),
      question: currentQuestion,
      answer: '',
      citations: [],
      createdAt: new Date().toISOString()
    }
    setChatHistory(prev => [...prev, tempChat])

    try {
      const response = await fetch(`/api/transcripts/${transcriptId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion })
      })

      if (response.ok) {
        const data = await response.json()
        setChatHistory(prev =>
          prev.map(c => c.id === tempChat.id ? {
            ...c,
            id: data.id,
            answer: data.answer,
            citations: data.citations
          } : c)
        )
      } else {
        const errorData = await response.json().catch(() => ({}))
        setChatHistory(prev =>
          prev.map(c => c.id === tempChat.id ? {
            ...c,
            answer: errorData.error || 'Sorry, I could not process your question. Please try again.',
            citations: []
          } : c)
        )
      }
    } catch (error) {
      setChatHistory(prev =>
        prev.map(c => c.id === tempChat.id ? {
          ...c,
          answer: 'Sorry, there was an error processing your question. Please try again.',
          citations: []
        } : c)
      )
    } finally {
      setAskingQuestion(false)
    }
  }

  const scrollToSegment = (segmentIndex: number) => {
    const el = segmentRefs.current[segmentIndex]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedSegments(new Set([segmentIndex]))
      setTimeout(() => setHighlightedSegments(new Set()), 3000)
    }
  }

  const highlightCitations = (citations: Citation[]) => {
    const indices = new Set(citations.map(c => c.segmentIndex))
    setHighlightedSegments(indices)
    // Scroll to first citation
    if (citations.length > 0) {
      scrollToSegment(citations[0].segmentIndex)
    }
  }

  // Build speaker index
  const speakers = transcript ? Array.from(new Set(transcript.segments.map(s => s.speaker).filter((s): s is string => Boolean(s)))) : []

  const filteredSegments = transcript?.segments.filter(s =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.speaker && s.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </PageContainer>
    )
  }

  if (!transcript) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <p className="text-gray-500">Transcript not found.</p>
          <Link href="/transcripts" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block">
            Back to transcripts
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Main Transcript Panel */}
      <div className={`flex-1 overflow-hidden flex flex-col ${showChat ? 'border-r border-gray-100' : ''}`}>
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/transcripts" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to transcripts
            </Link>
            <div className="flex items-center gap-2">
              <a
                href={transcript.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open original"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  showChat
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Ask Questions
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(transcript.feedUrl).hostname}&sz=16`}
              alt=""
              className="w-4 h-4 rounded"
            />
            <span className="text-xs font-medium text-gray-500">{transcript.feedTitle}</span>
            <span className="text-xs text-gray-300">&middot;</span>
            <span className="text-xs text-gray-400">
              {new Date(transcript.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-lg font-bold text-gray-900 leading-snug mb-3">{transcript.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
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
          </div>

          {/* Speaker Legend */}
          {speakers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {speakers.map((speaker, i) => {
                const color = getSpeakerColor(speaker, i)
                return (
                  <span key={speaker} className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${color.bg} ${color.text}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {speaker}
                  </span>
                )
              })}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {filteredSegments.length} matches
              </span>
            )}
          </div>
        </div>

        {/* Segments */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl space-y-1">
            {(searchQuery ? filteredSegments : transcript.segments).map((segment) => {
              const speakerIdx = speakers.indexOf(segment.speaker || '')
              const color = getSpeakerColor(segment.speaker, speakerIdx)
              const isHighlighted = highlightedSegments.has(segment.segmentIndex)

              return (
                <div
                  key={segment.id}
                  ref={(el) => { segmentRefs.current[segment.segmentIndex] = el }}
                  className={`group flex gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isHighlighted
                      ? 'bg-yellow-50 ring-2 ring-yellow-300 shadow-sm'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Timestamp */}
                  <div className="flex-shrink-0 pt-0.5">
                    <span className="text-[11px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTimestamp(segment.startTime)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {segment.speaker && (
                      <span className={`inline-block text-xs font-semibold mb-0.5 ${color.text}`}>
                        {segment.speaker}
                      </span>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {searchQuery ? highlightText(segment.text, searchQuery) : segment.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Q&A Chat Panel */}
      {showChat && (
        <div className="w-[420px] flex flex-col bg-gray-50/50 flex-shrink-0">
          {/* Chat Header */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-semibold text-gray-900">Ask about this transcript</h2>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ask questions and get answers with exact citations from the transcript
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {chatHistory.length === 0 && !askingQuestion && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MicrophoneIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Ask anything about this podcast episode
                </p>
                <div className="space-y-2">
                  {[
                    'What are the main topics discussed?',
                    "What does the guest say about AI safety?",
                    'What predictions are made about AGI?'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuestion(suggestion)
                      }}
                      className="block w-full text-left px-3 py-2.5 text-xs text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((chat) => (
              <div key={chat.id} className="space-y-3">
                {/* Question */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                    {chat.question}
                  </div>
                </div>

                {/* Answer */}
                {chat.answer ? (
                  <div className="space-y-2">
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[95%] shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{chat.answer}</p>
                    </div>

                    {/* Citations */}
                    {chat.citations.length > 0 && (
                      <div className="space-y-1.5 pl-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          <BookmarkIcon className="w-3 h-3" />
                          Citations
                        </div>
                        {chat.citations.map((citation, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              scrollToSegment(citation.segmentIndex)
                              highlightCitations([citation])
                            }}
                            className="block w-full text-left bg-white border border-gray-100 px-3 py-2 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group/cite"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {formatTimestamp(citation.startTime)}
                              </span>
                              {citation.speaker && (
                                <span className="text-[10px] font-medium text-gray-500">
                                  {citation.speaker}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed italic line-clamp-2">
                              &ldquo;{citation.text}&rdquo;
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 pl-2">
                    <div className="w-4 h-4 border-[2px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    Analyzing transcript...
                  </div>
                )}
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* Question Input */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAskQuestion()
                  }
                }}
                placeholder="Ask a question about this episode..."
                disabled={askingQuestion}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!question.trim() || askingQuestion}
                className="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl shadow-sm transition-all"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
      : part
  )
}
