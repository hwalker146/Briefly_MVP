'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PromptEditor } from '@/components/prompts/PromptEditor'
import { 
  PlusIcon, 
  SparklesIcon, 
  PencilIcon, 
  TrashIcon,
  EllipsisHorizontalIcon,
  GlobeAltIcon,
  UserIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

interface Prompt {
  id: string
  title: string
  content: string
  isGlobal: boolean
  createdAt: string
  updatedAt: string
  usageCount: number
  previewText: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>()
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Tech News Brief',
          content: 'Summarize in 3-5 bullet points, focusing on key innovations, business impact, and technical details. Include relevant metrics and end with a "Why it matters" section.',
          isGlobal: false,
          createdAt: '2025-01-25T10:30:00Z',
          updatedAt: '2025-01-28T14:20:00Z',
          usageCount: 45,
          previewText: 'Concise tech summaries with business impact analysis and key metrics'
        },
        {
          id: '2',
          title: 'Policy Analysis',
          content: 'Focus on policy implications, stakeholder impacts, regulatory changes, and long-term effects. Structure as: 1) What changed, 2) Who it affects, 3) Timeline, 4) Broader implications.',
          isGlobal: false,
          createdAt: '2025-01-24T15:20:00Z',
          updatedAt: '2025-01-24T15:20:00Z',
          usageCount: 23,
          previewText: 'Deep policy analysis with stakeholder impact and regulatory focus'
        },
        {
          id: '3',
          title: 'Quick Headlines',
          content: 'Just the key facts in 1-2 sentences maximum. Focus on what happened, when, and immediate impact only.',
          isGlobal: true,
          createdAt: '2025-01-20T09:45:00Z',
          updatedAt: '2025-01-26T11:30:00Z',
          usageCount: 12,
          previewText: 'Ultra-brief summaries with just essential facts'
        },
        {
          id: '4',
          title: 'Investment Research',
          content: 'Analyze financial implications, market impact, competitive positioning, and investment thesis. Include key numbers, valuation impacts, and risk factors.',
          isGlobal: false,
          createdAt: '2025-01-22T13:15:00Z',
          updatedAt: '2025-01-27T16:45:00Z',
          usageCount: 8,
          previewText: 'Financial analysis with market impact and investment insights'
        }
      ]
      
      setPrompts(mockPrompts)
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrompt = () => {
    setEditingPrompt(undefined)
    setShowEditor(true)
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setShowEditor(true)
  }

  const handleSavePrompt = async (promptData: Partial<Prompt>) => {
    if (editingPrompt) {
      // Update existing prompt
      setPrompts(prev => prev.map(p => 
        p.id === editingPrompt.id 
          ? { ...p, ...promptData, updatedAt: new Date().toISOString() }
          : p
      ))
    } else {
      // Create new prompt
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        title: promptData.title!,
        content: promptData.content!,
        isGlobal: promptData.isGlobal!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        previewText: promptData.content!.substring(0, 80) + '...'
      }
      setPrompts(prev => [newPrompt, ...prev])
    }
    setShowEditor(false)
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (confirm('Delete this prompt? This action cannot be undone.')) {
      setPrompts(prev => prev.filter(p => p.id !== promptId))
    }
  }

  const handleDuplicatePrompt = (prompt: Prompt) => {
    const duplicatedPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(),
      title: `${prompt.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    }
    setPrompts(prev => [duplicatedPrompt, ...prev])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatUsage = (count: number) => {
    if (count === 0) return 'Never used'
    if (count === 1) return '1 time'
    return `${count} times`
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
            <h1 className="text-28 font-bold text-gray-900">Prompts</h1>
            <p className="text-gray-600 mt-1">
              Create and manage AI summarization prompts for different types of content
            </p>
          </div>
          
          <button 
            onClick={handleCreatePrompt}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Prompt
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
          <span>{prompts.length} total prompts</span>
          <span>{prompts.filter(p => p.isGlobal).length} global</span>
          <span>{prompts.reduce((acc, p) => acc + p.usageCount, 0)} total uses</span>
        </div>
      </div>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create your first prompt</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Customize how AI summarizes your articles. Create different prompts for different types of content like tech news, policy updates, or research papers.
          </p>
          <button 
            onClick={handleCreatePrompt}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Prompt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {prompt.isGlobal ? (
                    <GlobeAltIcon className="w-5 h-5 text-blue-500" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    prompt.isGlobal 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {prompt.isGlobal ? 'Global' : 'Personal'}
                  </span>
                </div>
                
                <div className="relative">
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Toggle dropdown menu
                    }}
                  >
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{prompt.title}</h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {prompt.previewText}
              </p>

              <div className="flex items-center justify-between text-13 text-gray-500 mb-4">
                <span>Used {formatUsage(prompt.usageCount)}</span>
                <span>Updated {formatDate(prompt.updatedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditPrompt(prompt)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                
                <button
                  onClick={() => handleDuplicatePrompt(prompt)}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prompt Editor Modal */}
      <PromptEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSavePrompt}
        prompt={editingPrompt}
      />
    </PageContainer>
  )
}