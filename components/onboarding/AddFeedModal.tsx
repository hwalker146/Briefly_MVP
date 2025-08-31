'use client'

import { useState } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, RssIcon } from '@heroicons/react/24/outline'

interface FeedOption {
  url: string
  title: string
  description?: string
  favicon?: string
}

interface AddFeedModalProps {
  isOpen: boolean
  onClose: () => void
  onFeedSelected: (feed: FeedOption) => void
}

export function AddFeedModal({ isOpen, onClose, onFeedSelected }: AddFeedModalProps) {
  const [url, setUrl] = useState('')
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [feedOptions, setFeedOptions] = useState<FeedOption[]>([])
  const [error, setError] = useState('')

  const discoverFeeds = async (inputUrl: string) => {
    setIsDiscovering(true)
    setError('')
    setFeedOptions([])

    try {
      // Mock feed discovery - in real app, this would call the discovery API
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay

      // Mock discovered feeds based on domain
      const domain = new URL(inputUrl).hostname
      const mockFeeds: FeedOption[] = []

      if (domain.includes('techcrunch.com')) {
        mockFeeds.push({
          url: 'https://techcrunch.com/feed/',
          title: 'TechCrunch',
          description: 'The latest technology news and startup coverage',
          favicon: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32'
        })
      } else if (domain.includes('reuters.com')) {
        mockFeeds.push({
          url: 'https://www.reuters.com/arc/outboundfeeds/rss/?outputType=xml',
          title: 'Reuters Top News',
          description: 'Breaking news and analysis from around the world',
          favicon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=32'
        })
      } else if (domain.includes('nytimes.com')) {
        mockFeeds.push({
          url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
          title: 'NYTimes.com',
          description: 'Breaking news, analysis, and opinion from The New York Times',
          favicon: 'https://www.google.com/s2/favicons?domain=nytimes.com&sz=32'
        })
      } else {
        // Generic feed discovery
        mockFeeds.push({
          url: `${inputUrl}/feed`,
          title: `${domain} - Main Feed`,
          description: 'Latest articles and updates',
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
        })
      }

      setFeedOptions(mockFeeds)
    } catch (err) {
      setError('Could not discover feeds from this URL. Please try the direct RSS link.')
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    try {
      new URL(url) // Validate URL
      await discoverFeeds(url)
    } catch {
      setError('Please enter a valid URL')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Your First Feed</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {!feedOptions.length && !isDiscovering ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL or RSS Link
                </label>
                <div className="relative">
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://nytimes.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    autoFocus
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!url.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Discover Feeds
              </button>
            </form>
          ) : isDiscovering ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Discovering feeds...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Found {feedOptions.length} feed{feedOptions.length !== 1 ? 's' : ''}:
              </div>
              
              {feedOptions.map((feed, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={feed.favicon || `https://www.google.com/s2/favicons?domain=${new URL(feed.url).hostname}&sz=32`}
                      alt=""
                      className="w-8 h-8 rounded mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">{feed.title}</h3>
                      {feed.description && (
                        <p className="text-sm text-gray-600 mb-2">{feed.description}</p>
                      )}
                      <p className="text-13 text-gray-500 truncate">{feed.url}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onFeedSelected(feed)}
                    className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    <RssIcon className="w-4 h-4 mr-2" />
                    Subscribe to this feed
                  </button>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setUrl('')
                    setFeedOptions([])
                    setError('')
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Try another URL
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-13 text-gray-500">
              Popular feeds: <span className="text-indigo-600 cursor-pointer hover:underline">TechCrunch</span>, <span className="text-indigo-600 cursor-pointer hover:underline">Reuters</span>, <span className="text-indigo-600 cursor-pointer hover:underline">NY Times</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}