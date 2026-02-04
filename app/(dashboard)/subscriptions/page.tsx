'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import Link from 'next/link'
import {
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  RssIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface Prompt {
  id: string
  title: string
  content: string
  isGlobal: boolean
}

interface Subscription {
  id: string
  isActive: boolean
  feed: {
    id: string
    title: string
    description: string
    url: string
    favicon: string
  }
  prompt?: Prompt
  createdAt: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockPrompts: Prompt[] = [
        { id: '1', title: 'Tech News Brief', content: 'Summarize in 3 bullet points focusing on key innovations and business impact.', isGlobal: false },
        { id: '2', title: 'Policy Analysis', content: 'Focus on policy implications, stakeholder impacts, and long-term effects.', isGlobal: false },
        { id: '3', title: 'Quick Headlines', content: 'Just the key facts in 1-2 sentences maximum.', isGlobal: true }
      ]

      const mockSubscriptions: Subscription[] = [
        { id: '1', isActive: true, feed: { id: '1', title: 'TechCrunch', description: 'Technology news and startup coverage', url: 'https://techcrunch.com/feed/', favicon: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32' }, prompt: mockPrompts[0], createdAt: '2025-01-25T10:30:00Z' },
        { id: '2', isActive: true, feed: { id: '2', title: 'Reuters Technology', description: 'Global technology and business news', url: 'https://www.reuters.com/technology/rss', favicon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=32' }, prompt: mockPrompts[1], createdAt: '2025-01-24T15:20:00Z' },
        { id: '3', isActive: false, feed: { id: '3', title: 'Hacker News', description: 'Social news for developers and entrepreneurs', url: 'https://hnrss.org/frontpage', favicon: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=32' }, createdAt: '2025-01-23T09:45:00Z' }
      ]

      setPrompts(mockPrompts)
      setSubscriptions(mockSubscriptions)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubscription = (id: string) => {
    setSelectedSubscriptions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === subscriptions.length) {
      setSelectedSubscriptions([])
    } else {
      setSelectedSubscriptions(subscriptions.map(sub => sub.id))
    }
  }

  const handleToggleActive = (id: string) => {
    setSubscriptions(prev => prev.map(sub =>
      sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
    ))
    setOpenMenuId(null)
  }

  const handleDelete = (id: string) => {
    setOpenMenuId(null)
    if (confirm('Remove this subscription?')) {
      setSubscriptions(prev => prev.filter(sub => sub.id !== id))
      setSelectedSubscriptions(prev => prev.filter(i => i !== id))
    }
  }

  const handlePromptChange = (id: string, promptId: string | null) => {
    const selectedPrompt = promptId ? prompts.find(p => p.id === promptId) : undefined
    setSubscriptions(prev => prev.map(sub =>
      sub.id === id ? { ...sub, prompt: selectedPrompt } : sub
    ))
  }

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete' | 'assign-prompt', promptId?: string) => {
    switch (action) {
      case 'activate':
        setSubscriptions(prev => prev.map(sub =>
          selectedSubscriptions.includes(sub.id) ? { ...sub, isActive: true } : sub
        ))
        break
      case 'deactivate':
        setSubscriptions(prev => prev.map(sub =>
          selectedSubscriptions.includes(sub.id) ? { ...sub, isActive: false } : sub
        ))
        break
      case 'delete':
        if (confirm(`Delete ${selectedSubscriptions.length} subscription(s)?`)) {
          setSubscriptions(prev => prev.filter(sub => !selectedSubscriptions.includes(sub.id)))
        }
        break
      case 'assign-prompt':
        if (promptId) {
          const p = prompts.find(pr => pr.id === promptId)
          setSubscriptions(prev => prev.map(sub =>
            selectedSubscriptions.includes(sub.id) ? { ...sub, prompt: p } : sub
          ))
        }
        break
    }
    setSelectedSubscriptions([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscriptions</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your feed subscriptions and customize summarization prompts</p>
          </div>
          <Link
            href="/feeds"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Add Subscription
          </Link>
        </div>

        {/* Bulk Actions Bar */}
        {selectedSubscriptions.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">
                {selectedSubscriptions.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                  Activate
                </button>
                <button onClick={() => handleBulkAction('deactivate')} className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                  Pause
                </button>
                <select
                  onChange={(e) => handleBulkAction('assign-prompt', e.target.value)}
                  className="px-3 py-1.5 text-xs border border-indigo-200 rounded-lg bg-white text-indigo-600"
                  defaultValue=""
                >
                  <option value="">Assign Prompt</option>
                  {prompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Delete
                </button>
                <button onClick={() => setSelectedSubscriptions([])} className="p-1 text-indigo-400 hover:text-indigo-600">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <span>{subscriptions.length} total</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{subscriptions.filter(s => s.isActive).length} active</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{subscriptions.filter(s => s.prompt).length} with prompts</span>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <RssIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscriptions yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Subscribe to some RSS feeds to start receiving personalized summaries.
          </p>
          <Link
            href="/feeds"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm shadow-indigo-200 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Browse Feeds
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-12 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.length === subscriptions.length && subscriptions.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Feed</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prompt</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscriptions.includes(sub.id)}
                        onChange={() => handleSelectSubscription(sub.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={sub.feed.favicon} alt="" className="w-7 h-7 rounded-lg" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{sub.feed.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">{sub.feed.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="relative">
                        <select
                          value={sub.prompt?.id || ''}
                          onChange={(e) => handlePromptChange(sub.id, e.target.value || null)}
                          className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Default</option>
                          {prompts.map(p => (
                            <option key={p.id} value={p.id}>{p.title}{p.isGlobal ? ' (Global)' : ''}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(sub.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          sub.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {sub.isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
                            Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            Paused
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatDate(sub.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === sub.id ? null : sub.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>

                        {openMenuId === sub.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                              <button
                                onClick={() => handleToggleActive(sub.id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                {sub.isActive ? <PauseIcon className="w-4 h-4 text-gray-400" /> : <PlayIcon className="w-4 h-4 text-gray-400" />}
                                {sub.isActive ? 'Pause' : 'Activate'}
                              </button>
                              <Link
                                href="/articles"
                                onClick={() => setOpenMenuId(null)}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <RssIcon className="w-4 h-4 text-gray-400" />
                                View Articles
                              </Link>
                              <div className="my-1 border-t border-gray-100" />
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
