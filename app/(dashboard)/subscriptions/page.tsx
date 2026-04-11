'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import Link from 'next/link'
import {
  XMarkIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  RssIcon,
  PlusIcon,
  FolderIcon
} from '@heroicons/react/24/outline'

interface Prompt {
  id: string
  title: string
  content: string
  isGlobal: boolean
}

interface Category {
  id: string
  name: string
  color: string
}

interface Subscription {
  id: string
  isActive: boolean
  feed: {
    id: string
    title: string
    description: string | null
    url: string
    siteUrl: string | null
  }
  prompt?: Prompt | null
  category?: Category | null
  createdAt: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [subsRes, promptsRes, categoriesRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/prompts'),
        fetch('/api/categories')
      ])

      if (subsRes.ok) {
        const subsData = await subsRes.json()
        setSubscriptions(subsData.subscriptions || [])
      }

      if (promptsRes.ok) {
        const promptsData = await promptsRes.json()
        setPrompts(promptsData.prompts || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }
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

  const handleToggleActive = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (!sub) return

    setActionLoading(id)
    setOpenMenuId(null)

    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sub.isActive })
      })

      if (res.ok) {
        setSubscriptions(prev => prev.map(s =>
          s.id === id ? { ...s, isActive: !s.isActive } : s
        ))
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setOpenMenuId(null)
    if (!confirm('Remove this subscription?')) return

    setActionLoading(id)

    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })

      if (res.ok) {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id))
        setSelectedSubscriptions(prev => prev.filter(i => i !== id))
      }
    } catch (error) {
      console.error('Error deleting subscription:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePromptChange = async (id: string, promptId: string | null) => {
    setActionLoading(id)

    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: promptId || null })
      })

      if (res.ok) {
        const selectedPrompt = promptId ? prompts.find(p => p.id === promptId) : null
        setSubscriptions(prev => prev.map(sub =>
          sub.id === id ? { ...sub, prompt: selectedPrompt } : sub
        ))
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCategoryChange = async (id: string, categoryId: string | null) => {
    setActionLoading(id)

    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: categoryId || null })
      })

      if (res.ok) {
        const selectedCategory = categoryId ? categories.find(c => c.id === categoryId) : null
        setSubscriptions(prev => prev.map(sub =>
          sub.id === id ? { ...sub, category: selectedCategory } : sub
        ))
      }
    } catch (error) {
      console.error('Error updating category:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'assign-prompt' | 'assign-category', promptId?: string, categoryId?: string) => {
    if (selectedSubscriptions.length === 0) return

    if (action === 'delete' && !confirm(`Delete ${selectedSubscriptions.length} subscription(s)?`)) {
      return
    }

    setActionLoading('bulk')

    try {
      await Promise.all(selectedSubscriptions.map(async (id) => {
        switch (action) {
          case 'activate':
            await fetch(`/api/subscriptions/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: true })
            })
            break
          case 'deactivate':
            await fetch(`/api/subscriptions/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: false })
            })
            break
          case 'delete':
            await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
            break
          case 'assign-prompt':
            if (promptId !== undefined) {
              await fetch(`/api/subscriptions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promptId: promptId || null })
              })
            }
            break
          case 'assign-category':
            if (categoryId !== undefined) {
              await fetch(`/api/subscriptions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId: categoryId || null })
              })
            }
            break
        }
      }))

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error with bulk action:', error)
    } finally {
      setActionLoading(null)
      setSelectedSubscriptions([])
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getFavicon = (url: string | null) => {
    if (!url) return '/favicon.ico'
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return '/favicon.ico'
    }
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
                <button
                  onClick={() => handleBulkAction('activate')}
                  disabled={actionLoading === 'bulk'}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={actionLoading === 'bulk'}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  Pause
                </button>
                <select
                  onChange={(e) => handleBulkAction('assign-prompt', e.target.value)}
                  disabled={actionLoading === 'bulk'}
                  className="px-3 py-1.5 text-xs border border-indigo-200 rounded-lg bg-white text-indigo-600 disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">Assign Prompt</option>
                  {prompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <select
                  onChange={(e) => handleBulkAction('assign-category', undefined, e.target.value)}
                  disabled={actionLoading === 'bulk'}
                  className="px-3 py-1.5 text-xs border border-indigo-200 rounded-lg bg-white text-indigo-600 disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">Assign Category</option>
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={actionLoading === 'bulk'}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
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
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{subscriptions.filter(s => s.category).length} categorized</span>
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
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prompt</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className={`hover:bg-gray-50/50 transition-colors ${actionLoading === sub.id ? 'opacity-50' : ''}`}>
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
                        <img src={getFavicon(sub.feed.siteUrl || sub.feed.url)} alt="" className="w-7 h-7 rounded-lg" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{sub.feed.title || 'Untitled Feed'}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">{sub.feed.description || sub.feed.url}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="relative">
                        <select
                          value={sub.category?.id || ''}
                          onChange={(e) => handleCategoryChange(sub.id, e.target.value || null)}
                          disabled={actionLoading === sub.id}
                          className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">None</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="relative">
                        <select
                          value={sub.prompt?.id || ''}
                          onChange={(e) => handlePromptChange(sub.id, e.target.value || null)}
                          disabled={actionLoading === sub.id}
                          className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
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
                        disabled={actionLoading === sub.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
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
                          disabled={actionLoading === sub.id}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
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
