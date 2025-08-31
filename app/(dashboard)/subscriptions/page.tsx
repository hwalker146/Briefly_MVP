'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { 
  CheckIcon, 
  XMarkIcon, 
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon
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
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setShowBulkActions(selectedSubscriptions.length > 0)
  }, [selectedSubscriptions])

  const fetchData = async () => {
    try {
      // Mock data - will be replaced with real API calls
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Tech News Brief',
          content: 'Summarize in 3 bullet points focusing on key innovations and business impact.',
          isGlobal: false
        },
        {
          id: '2', 
          title: 'Policy Analysis',
          content: 'Focus on policy implications, stakeholder impacts, and long-term effects.',
          isGlobal: false
        },
        {
          id: '3',
          title: 'Quick Headlines',
          content: 'Just the key facts in 1-2 sentences maximum.',
          isGlobal: true
        }
      ]

      const mockSubscriptions: Subscription[] = [
        {
          id: '1',
          isActive: true,
          feed: {
            id: '1',
            title: 'TechCrunch',
            description: 'Technology news and startup coverage',
            url: 'https://techcrunch.com/feed/',
            favicon: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32'
          },
          prompt: mockPrompts[0],
          createdAt: '2025-01-25T10:30:00Z'
        },
        {
          id: '2',
          isActive: true,
          feed: {
            id: '2',
            title: 'Reuters Technology',
            description: 'Global technology and business news',
            url: 'https://www.reuters.com/technology/rss',
            favicon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=32'
          },
          prompt: mockPrompts[1],
          createdAt: '2025-01-24T15:20:00Z'
        },
        {
          id: '3',
          isActive: false,
          feed: {
            id: '3',
            title: 'Hacker News',
            description: 'Social news for developers and entrepreneurs',
            url: 'https://hnrss.org/frontpage',
            favicon: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=32'
          },
          createdAt: '2025-01-23T09:45:00Z'
        }
      ]

      setPrompts(mockPrompts)
      setSubscriptions(mockSubscriptions)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubscription = (subscriptionId: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(subscriptionId)
        ? prev.filter(id => id !== subscriptionId)
        : [...prev, subscriptionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === subscriptions.length) {
      setSelectedSubscriptions([])
    } else {
      setSelectedSubscriptions(subscriptions.map(sub => sub.id))
    }
  }

  const handleToggleActive = async (subscriptionId: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, isActive: !sub.isActive }
        : sub
    ))
  }

  const handlePromptChange = async (subscriptionId: string, promptId: string | null) => {
    const selectedPrompt = promptId ? prompts.find(p => p.id === promptId) : undefined
    
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, prompt: selectedPrompt }
        : sub
    ))
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'assign-prompt', promptId?: string) => {
    switch (action) {
      case 'activate':
        setSubscriptions(prev => prev.map(sub => 
          selectedSubscriptions.includes(sub.id) 
            ? { ...sub, isActive: true }
            : sub
        ))
        break
      case 'deactivate':
        setSubscriptions(prev => prev.map(sub => 
          selectedSubscriptions.includes(sub.id) 
            ? { ...sub, isActive: false }
            : sub
        ))
        break
      case 'delete':
        if (confirm(`Delete ${selectedSubscriptions.length} subscription(s)?`)) {
          setSubscriptions(prev => prev.filter(sub => !selectedSubscriptions.includes(sub.id)))
        }
        break
      case 'assign-prompt':
        if (promptId) {
          const selectedPrompt = prompts.find(p => p.id === promptId)
          setSubscriptions(prev => prev.map(sub => 
            selectedSubscriptions.includes(sub.id) 
              ? { ...sub, prompt: selectedPrompt }
              : sub
          ))
        }
        break
    }
    setSelectedSubscriptions([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-28 font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600 mt-1">
              Manage your feed subscriptions and customize summarization prompts
            </p>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">
                {selectedSubscriptions.length} subscription(s) selected
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  Pause
                </button>
                
                <select 
                  onChange={(e) => handleBulkAction('assign-prompt', e.target.value)}
                  className="px-3 py-1 text-sm border border-indigo-200 rounded-md bg-white text-indigo-600"
                  defaultValue=""
                >
                  <option value="">Assign Prompt</option>
                  {prompts.map(prompt => (
                    <option key={prompt.id} value={prompt.id}>{prompt.title}</option>
                  ))}
                  <option value="none">No Prompt</option>
                </select>
                
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
                
                <button
                  onClick={() => setSelectedSubscriptions([])}
                  className="p-1 text-indigo-400 hover:text-indigo-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
          <span>{subscriptions.length} total subscriptions</span>
          <span>{subscriptions.filter(s => s.isActive).length} active</span>
          <span>{subscriptions.filter(s => s.prompt).length} with custom prompts</span>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedSubscriptions.length === subscriptions.length && subscriptions.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prompt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.includes(subscription.id)}
                      onChange={() => handleSelectSubscription(subscription.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={subscription.feed.favicon}
                        alt=""
                        className="w-6 h-6 rounded mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.feed.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {subscription.feed.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={subscription.prompt?.id || ''}
                        onChange={(e) => handlePromptChange(subscription.id, e.target.value || null)}
                        className="appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Default</option>
                        {prompts.map(prompt => (
                          <option key={prompt.id} value={prompt.id}>
                            {prompt.title}
                            {prompt.isGlobal ? ' (Global)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(subscription.id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subscription.isActive ? (
                        <>
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="w-3 h-3 mr-1" />
                          Paused
                        </>
                      )}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(subscription.createdAt)}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
          <p className="text-gray-600 mb-4">
            Subscribe to some RSS feeds to start receiving personalized summaries.
          </p>
          <button className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
            Browse Feeds
          </button>
        </div>
      )}
    </PageContainer>
  )
}