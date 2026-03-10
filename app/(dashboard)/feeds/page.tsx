'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { FeedCard } from '@/components/feeds/FeedCard'
import {
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  RssIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

interface Feed {
  id: string
  title: string
  description?: string
  url: string
  siteUrl?: string
  lastFetched?: string
  lastPublished?: string
  latestHeadline?: string
  unreadCount: number
  isSubscribed: boolean
  subscriptionId?: string
  fetchStatus: 'success' | 'error' | 'pending'
}

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all')
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [addingFeed, setAddingFeed] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    try {
      const response = await fetch('/api/feeds')
      if (response.ok) {
        const data = await response.json()
        setFeeds(data.feeds || [])
      } else {
        setFeeds([])
      }
    } catch (error) {
      console.error('Error fetching feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (feedId: string) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId })
      })

      if (!response.ok) {
        throw new Error('Failed to subscribe')
      }

      const data = await response.json()
      setFeeds(prev => prev.map(feed =>
        feed.id === feedId
          ? { ...feed, isSubscribed: true, subscriptionId: data.subscription.id }
          : feed
      ))
    } catch (error) {
      console.error('Error subscribing to feed:', error)
      alert('Failed to subscribe to feed. Please try again.')
    }
  }

  const handleUnsubscribe = async (feedId: string) => {
    const feed = feeds.find(f => f.id === feedId)
    if (!feed?.subscriptionId) {
      console.error('No subscription ID found for feed')
      return
    }

    try {
      const response = await fetch(`/api/subscriptions/${feed.subscriptionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to unsubscribe')
      }

      setFeeds(prev => prev.map(f =>
        f.id === feedId
          ? { ...f, isSubscribed: false, subscriptionId: undefined }
          : f
      ))
    } catch (error) {
      console.error('Error unsubscribing from feed:', error)
      alert('Failed to unsubscribe from feed. Please try again.')
    }
  }

  const handleViewFeed = (feedId: string) => {
    console.log('View feed:', feedId)
  }

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return

    setAddingFeed(true)
    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newFeedUrl.trim() })
      })

      if (response.ok) {
        await fetchFeeds()
        setNewFeedUrl('')
        setShowAddDialog(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to add feed: ${errorData.details || errorData.error}`)
      }
    } catch (error) {
      alert('Error adding feed. Please try again.')
    } finally {
      setAddingFeed(false)
    }
  }

  const handleExportOPML = async () => {
    try {
      const response = await fetch('/api/opml/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `briefly-feeds-${new Date().toISOString().split('T')[0]}.opml`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export feeds. Please try again.')
    }
  }

  const handleImportOPML = async (file: File) => {
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/opml/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      alert(`Import complete! ${data.results.imported} feeds imported, ${data.results.skipped} skipped, ${data.results.categoriesCreated} categories created.`)
      setShowImportDialog(false)
      await fetchFeeds()
    } catch (error) {
      console.error('Import error:', error)
      alert(error instanceof Error ? error.message : 'Failed to import OPML file.')
    } finally {
      setImporting(false)
    }
  }

  const filteredFeeds = feeds.filter(feed => {
    const matchesSearch = feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feed.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filter === 'all' ||
      (filter === 'subscribed' && feed.isSubscribed) ||
      (filter === 'unsubscribed' && !feed.isSubscribed)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 mt-4">Loading your feeds...</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feeds</h1>
            <p className="text-sm text-gray-500 mt-1">
              Discover and manage RSS feeds from your favorite sources
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <button
              onClick={() => setShowImportDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              title="Import OPML"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExportOPML}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              title="Export OPML"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm transition-all duration-200"
            >
              <PlusIcon className="w-4 h-4" />
              Add Feed
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search feeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'subscribed' | 'unsubscribed')}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            >
              <option value="all">All feeds</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Not subscribed</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            {filteredFeeds.length} {filteredFeeds.length === 1 ? 'feed' : 'feeds'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {feeds.filter(f => f.isSubscribed).length} subscribed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {feeds.reduce((acc, f) => acc + f.unreadCount, 0)} unread articles
          </span>
        </div>
      </div>

      {/* Feeds Grid/List */}
      {filteredFeeds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <RssIcon className="w-7 h-7 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No feeds found' : 'No feeds yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Add your first RSS feed to get started with personalized summaries.'
            }
          </p>
          <div className="flex items-center justify-center gap-3">
            {!searchQuery && (
              <button
                onClick={() => setShowAddDialog(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4" />
                Add Feed
              </button>
            )}
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              View all articles
            </Link>
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'space-y-3'
        }>
          {filteredFeeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              viewMode={viewMode}
              onSubscribe={handleSubscribe}
              onUnsubscribe={handleUnsubscribe}
              onViewFeed={handleViewFeed}
            />
          ))}
        </div>
      )}

      {/* Add Feed Modal */}
      {showAddDialog && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddDialog(false)
              setNewFeedUrl('')
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowAddDialog(false)
                setNewFeedUrl('')
              }}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center mb-4">
                <RssIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add RSS Feed</h3>
              <p className="text-sm text-gray-500 mt-1">Enter the URL of the RSS or Atom feed you want to follow.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Feed URL
                </label>
                <input
                  type="url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFeedUrl.trim() && !addingFeed) {
                      handleAddFeed()
                    }
                  }}
                  placeholder="https://example.com/feed.xml"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddDialog(false)
                    setNewFeedUrl('')
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFeed}
                  disabled={addingFeed || !newFeedUrl.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all duration-200"
                >
                  {addingFeed ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-[3px] border-indigo-100 border-t-white rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    'Add Feed'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import OPML Modal */}
      {showImportDialog && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !importing) {
              setShowImportDialog(false)
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => !importing && setShowImportDialog(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center mb-4">
                <ArrowUpTrayIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Import OPML</h3>
              <p className="text-sm text-gray-500 mt-1">Upload an OPML file to import feeds from another reader.</p>
            </div>

            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file && (file.name.endsWith('.opml') || file.name.endsWith('.xml'))) {
                    handleImportOPML(file)
                  } else {
                    alert('Please drop a valid OPML file (.opml or .xml)')
                  }
                }}
              >
                <input
                  type="file"
                  accept=".opml,.xml"
                  className="hidden"
                  id="opml-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImportOPML(file)
                  }}
                />
                <label
                  htmlFor="opml-file"
                  className="cursor-pointer"
                >
                  {importing ? (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
                      <span className="text-sm text-gray-500">Importing feeds...</span>
                    </div>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <span className="text-sm text-gray-600 font-medium">Drop OPML file here or click to browse</span>
                      <span className="text-xs text-gray-400 block mt-1">Supports .opml and .xml files</span>
                    </>
                  )}
                </label>
              </div>

              <button
                onClick={() => setShowImportDialog(false)}
                disabled={importing}
                className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
