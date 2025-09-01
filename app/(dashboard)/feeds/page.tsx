'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { FeedCard } from '@/components/feeds/FeedCard'
import { 
  PlusIcon, 
  Squares2X2Icon, 
  ListBulletIcon, 
  MagnifyingGlassIcon,
  FunnelIcon
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
        // Fallback to mock data if API fails
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setFeeds([
        {
          id: '1',
          title: 'TechCrunch',
          description: 'TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.',
          url: 'https://techcrunch.com/feed/',
          siteUrl: 'https://techcrunch.com',
          lastFetched: '2025-01-29T10:30:00Z',
          latestHeadline: 'New AI Model Achieves Breakthrough in Language Understanding',
          unreadCount: 12,
          isSubscribed: true,
          fetchStatus: 'success'
        },
        {
          id: '2',
          title: 'Reuters Technology',
          description: 'Reuters technology news covering the latest developments in tech, innovation, and digital transformation.',
          url: 'https://www.reuters.com/technology/rss',
          siteUrl: 'https://reuters.com',
          lastFetched: '2025-01-29T09:15:00Z',
          latestHeadline: 'Climate Policy Changes Announced for 2025',
          unreadCount: 8,
          isSubscribed: true,
          fetchStatus: 'success'
        },
        {
          id: '3',
          title: 'Hacker News',
          description: 'Social news website focusing on computer science and entrepreneurship.',
          url: 'https://hnrss.org/frontpage',
          siteUrl: 'https://news.ycombinator.com',
          lastFetched: '2025-01-29T08:45:00Z',
          latestHeadline: 'Show HN: I built a tool for RSS management',
          unreadCount: 25,
          isSubscribed: false,
          fetchStatus: 'success'
        },
        {
          id: '4',
          title: 'Ars Technica',
          description: 'Technology news and analysis with a focus on science and policy.',
          url: 'https://feeds.arstechnica.com/arstechnica/index',
          siteUrl: 'https://arstechnica.com',
          lastFetched: '2025-01-28T20:10:00Z',
          latestHeadline: 'SpaceX launches new satellite constellation',
          unreadCount: 0,
          isSubscribed: false,
          fetchStatus: 'error'
        },
        {
          id: '5',
          title: 'The Verge',
          description: 'Technology, science, art, and culture coverage with a focus on the future.',
          url: 'https://www.theverge.com/rss/index.xml',
          siteUrl: 'https://theverge.com',
          lastFetched: '2025-01-29T11:00:00Z',
          latestHeadline: 'Apple announces new MacBook Pro with M3 chip',
          unreadCount: 6,
          isSubscribed: false,
          fetchStatus: 'success'
        }
      ])
      }
    } catch (error) {
      console.error('Error fetching feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (feedId: string) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId ? { ...feed, isSubscribed: true } : feed
    ))
  }

  const handleUnsubscribe = async (feedId: string) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId ? { ...feed, isSubscribed: false } : feed
    ))
  }

  const handleViewFeed = (feedId: string) => {
    console.log('View feed:', feedId)
    // Will implement feed detail slide-over
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
        const data = await response.json()
        await fetchFeeds() // Refresh the feeds list
        setNewFeedUrl('')
        setShowAddDialog(false)
      } else {
        alert('Failed to add feed. Please check the URL and try again.')
      }
    } catch (error) {
      alert('Error adding feed. Please try again.')
    } finally {
      setAddingFeed(false)
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-28 font-bold text-gray-900">Feeds</h1>
            <p className="text-gray-600 mt-1">
              Discover and manage RSS feeds from your favorite sources
            </p>
          </div>
          
          <button 
            onClick={() => setShowAddDialog(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Feed
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search feeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            >
              <option value="all">All feeds</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Not subscribed</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
          <span>{filteredFeeds.length} feeds</span>
          <span>{feeds.filter(f => f.isSubscribed).length} subscribed</span>
          <span>{feeds.reduce((acc, f) => acc + f.unreadCount, 0)} unread articles</span>
        </div>
      </div>

      {/* Feeds Grid/List */}
      {filteredFeeds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ListBulletIcon className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No feeds found' : 'No feeds yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : 'Add your first RSS feed to get started with personalized summaries.'
            }
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Feed
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
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

      {/* Add Feed Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add RSS Feed</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RSS Feed URL
                </label>
                <input
                  type="url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddDialog(false)
                    setNewFeedUrl('')
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFeed}
                  disabled={addingFeed || !newFeedUrl.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-md transition-colors"
                >
                  {addingFeed ? 'Adding...' : 'Add Feed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}