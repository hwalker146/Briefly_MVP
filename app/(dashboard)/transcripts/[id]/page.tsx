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

// Mock data for display
const MOCK_TRANSCRIPT: TranscriptData = {
  id: 'mock-1',
  articleId: 'a1',
  title: 'The Future of AI: Interview with Leading Researchers',
  articleUrl: 'https://example.com/episode-1',
  feedTitle: 'Lex Fridman Podcast',
  feedUrl: 'https://lexfridman.com',
  publishedAt: '2025-01-28T10:00:00Z',
  duration: 7200,
  wordCount: 15420,
  speakerCount: 2,
  language: 'en',
  fullText: '',
  status: 'READY',
  segments: [
    { id: 's0', segmentIndex: 0, speaker: 'Lex Fridman', text: 'Welcome to the podcast. Today we have a very special guest, one of the leading researchers in artificial intelligence. Thank you for joining me.', startTime: 0, endTime: 12.5 },
    { id: 's1', segmentIndex: 1, speaker: 'Guest', text: "Thanks for having me, Lex. It's great to be here. I've been a fan of the show for a long time.", startTime: 12.5, endTime: 18.3 },
    { id: 's2', segmentIndex: 2, speaker: 'Lex Fridman', text: "Let's dive right in. You've been working on large language models for over a decade now. How has your perspective changed on where AI is headed?", startTime: 18.3, endTime: 28.7 },
    { id: 's3', segmentIndex: 3, speaker: 'Guest', text: "That's a great question. When I started, we were still debating whether neural networks would ever work at scale. Now we've seen them transform everything from language to protein folding. The key insight was that scaling laws hold - more data, more compute, better results. But what surprised me most was the emergence of capabilities we didn't explicitly train for.", startTime: 28.7, endTime: 52.1 },
    { id: 's4', segmentIndex: 4, speaker: 'Lex Fridman', text: "Can you give an example of these emergent capabilities? I think a lot of people are fascinated by this.", startTime: 52.1, endTime: 58.4 },
    { id: 's5', segmentIndex: 5, speaker: 'Guest', text: "Sure. Take chain-of-thought reasoning. Nobody trained the model to break problems into steps - it just learned to do that from the data. Or consider how models can translate between languages they were barely exposed to. These are capabilities that emerge naturally at sufficient scale. It's both exciting and a little unsettling, because it means we don't fully understand what our models can and can't do.", startTime: 58.4, endTime: 82.6 },
    { id: 's6', segmentIndex: 6, speaker: 'Lex Fridman', text: "That ties into the alignment problem. How do you think about safety when you can't predict what capabilities will emerge?", startTime: 82.6, endTime: 91.2 },
    { id: 's7', segmentIndex: 7, speaker: 'Guest', text: "This is the central challenge of our time, honestly. My view is that we need a multi-pronged approach. First, interpretability research - understanding what's happening inside these models. Second, robust evaluation frameworks that test for unexpected behaviors. And third, a culture of responsible deployment where we don't rush to release models without thorough testing.", startTime: 91.2, endTime: 118.5 },
    { id: 's8', segmentIndex: 8, speaker: 'Lex Fridman', text: "Some people argue that open-sourcing models is dangerous because bad actors could misuse them. Others say open source is essential for safety because more eyes means more scrutiny. Where do you fall?", startTime: 118.5, endTime: 133.2 },
    { id: 's9', segmentIndex: 9, speaker: 'Guest', text: "I'm strongly in favor of open research and open models. The benefits of transparency far outweigh the risks. When models are closed, only a handful of people can audit them. When they're open, the entire research community can find problems and propose solutions. History shows that security through obscurity never works in the long run.", startTime: 133.2, endTime: 158.7 },
    { id: 's10', segmentIndex: 10, speaker: 'Lex Fridman', text: "Let's talk about AGI. Do you think we'll achieve artificial general intelligence in our lifetime?", startTime: 158.7, endTime: 166.3 },
    { id: 's11', segmentIndex: 11, speaker: 'Guest', text: "I think we need to be careful with the term AGI because it means different things to different people. If you mean a system that can do any intellectual task a human can, I think we're closer than most people realize. Maybe 10 to 20 years. But if you mean a system that truly understands the world the way humans do, with embodied experience and common sense, that's a much harder problem. The current approach of scaling language models gets us surprisingly far, but there are fundamental gaps in grounding and world understanding.", startTime: 166.3, endTime: 205.8 },
    { id: 's12', segmentIndex: 12, speaker: 'Lex Fridman', text: "What do you think is the biggest misconception the public has about AI right now?", startTime: 205.8, endTime: 212.1 },
    { id: 's13', segmentIndex: 13, speaker: 'Guest', text: "That it either works perfectly or it's completely useless. The reality is much more nuanced. These models are incredibly capable in some domains and surprisingly brittle in others. They can write poetry and code but struggle with basic arithmetic. Understanding these limitations is crucial for using AI responsibly.", startTime: 212.1, endTime: 237.4 },
  ],
  chats: []
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
        // Use mock data for demo
        setTranscript(MOCK_TRANSCRIPT)
        setChatHistory(MOCK_TRANSCRIPT.chats)
      }
    } catch (error) {
      console.error('Error fetching transcript:', error)
      setTranscript(MOCK_TRANSCRIPT)
      setChatHistory(MOCK_TRANSCRIPT.chats)
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
        // Mock response for demo
        const mockAnswer = generateMockAnswer(currentQuestion, transcript?.segments || [])
        setChatHistory(prev =>
          prev.map(c => c.id === tempChat.id ? {
            ...c,
            id: 'mock-' + Date.now(),
            answer: mockAnswer.answer,
            citations: mockAnswer.citations
          } : c)
        )
      }
    } catch (error) {
      // Use mock response
      const mockAnswer = generateMockAnswer(currentQuestion, transcript?.segments || [])
      setChatHistory(prev =>
        prev.map(c => c.id === tempChat.id ? {
          ...c,
          id: 'mock-' + Date.now(),
          answer: mockAnswer.answer,
          citations: mockAnswer.citations
        } : c)
      )
    } finally {
      setAskingQuestion(false)
    }
  }

  const generateMockAnswer = (q: string, segments: Segment[]): { answer: string; citations: Citation[] } => {
    const lq = q.toLowerCase()
    if (lq.includes('agi') || lq.includes('general intelligence')) {
      return {
        answer: 'The guest believes AGI is closer than most people realize, potentially 10 to 20 years away for systems that can perform any intellectual task [Segment 11]. However, they draw an important distinction: true understanding with embodied experience and common sense is a "much harder problem" that current scaling approaches may not solve [Segment 11]. They note that "the current approach of scaling language models gets us surprisingly far, but there are fundamental gaps in grounding and world understanding."',
        citations: [
          { segmentIndex: 11, text: "I think we're closer than most people realize. Maybe 10 to 20 years.", startTime: 166.3, endTime: 205.8, speaker: 'Guest' },
          { segmentIndex: 11, text: "there are fundamental gaps in grounding and world understanding", startTime: 166.3, endTime: 205.8, speaker: 'Guest' }
        ]
      }
    }
    if (lq.includes('safety') || lq.includes('alignment') || lq.includes('risk')) {
      return {
        answer: 'The guest outlines a three-pronged approach to AI safety [Segment 7]: First, interpretability research to understand what happens inside models. Second, robust evaluation frameworks for unexpected behaviors. Third, a culture of responsible deployment. They call this "the central challenge of our time." On the topic of open-sourcing, they strongly advocate for openness [Segment 9], arguing that "the benefits of transparency far outweigh the risks" and that "security through obscurity never works in the long run."',
        citations: [
          { segmentIndex: 7, text: "we need a multi-pronged approach. First, interpretability research... Second, robust evaluation frameworks... And third, a culture of responsible deployment", startTime: 91.2, endTime: 118.5, speaker: 'Guest' },
          { segmentIndex: 9, text: "The benefits of transparency far outweigh the risks", startTime: 133.2, endTime: 158.7, speaker: 'Guest' }
        ]
      }
    }
    if (lq.includes('emergent') || lq.includes('capabilities') || lq.includes('scaling')) {
      return {
        answer: 'The guest discusses emergent capabilities as one of the most surprising developments in AI [Segment 5]. They give two key examples: chain-of-thought reasoning, where "nobody trained the model to break problems into steps - it just learned to do that from the data," and cross-lingual translation with minimal training data. They describe these as capabilities that "emerge naturally at sufficient scale," noting it is "both exciting and a little unsettling, because it means we don\'t fully understand what our models can and can\'t do." The guest also references scaling laws [Segment 3] as a key insight: "more data, more compute, better results."',
        citations: [
          { segmentIndex: 5, text: "Nobody trained the model to break problems into steps - it just learned to do that from the data", startTime: 58.4, endTime: 82.6, speaker: 'Guest' },
          { segmentIndex: 3, text: "The key insight was that scaling laws hold - more data, more compute, better results", startTime: 28.7, endTime: 52.1, speaker: 'Guest' }
        ]
      }
    }
    // Default
    return {
      answer: 'The guest discusses several key themes throughout this episode. On the state of AI, they note that "scaling laws hold" and that emergent capabilities like chain-of-thought reasoning have surprised the research community [Segment 3, 5]. Regarding misconceptions, they point out that the public often sees AI as "either works perfectly or it\'s completely useless," when reality is far more nuanced [Segment 13]. They advocate strongly for open-source AI development, believing "the benefits of transparency far outweigh the risks" [Segment 9].',
      citations: [
        { segmentIndex: 3, text: "scaling laws hold - more data, more compute, better results", startTime: 28.7, endTime: 52.1, speaker: 'Guest' },
        { segmentIndex: 13, text: "That it either works perfectly or it's completely useless. The reality is much more nuanced.", startTime: 212.1, endTime: 237.4, speaker: 'Guest' },
        { segmentIndex: 9, text: "The benefits of transparency far outweigh the risks", startTime: 133.2, endTime: 158.7, speaker: 'Guest' }
      ]
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
