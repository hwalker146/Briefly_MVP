'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts')
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const data = await response.json()

      // Map API response to component's Prompt interface
      const mappedPrompts: Prompt[] = (data.prompts || []).map((p: {
        id: string
        title: string
        content: string
        isGlobal: boolean
        createdAt: string
        updatedAt: string
        summaryCount?: number
      }) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        isGlobal: p.isGlobal,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        usageCount: p.summaryCount || 0,
        previewText: p.content.length > 80 ? p.content.substring(0, 80) + '...' : p.content
      }))

      setPrompts(mappedPrompts)
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
    setOpenMenuId(null)
  }

  const handleSavePrompt = async (promptData: Partial<Prompt>) => {
    try {
      if (editingPrompt) {
        // Update existing prompt
        const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: promptData.title,
            content: promptData.content,
            isGlobal: promptData.isGlobal
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update prompt')
        }

        const data = await response.json()
        setPrompts(prev => prev.map(p =>
          p.id === editingPrompt.id
            ? {
                ...p,
                title: data.prompt.title,
                content: data.prompt.content,
                isGlobal: data.prompt.isGlobal,
                updatedAt: data.prompt.updatedAt,
                previewText: data.prompt.content.length > 80
                  ? data.prompt.content.substring(0, 80) + '...'
                  : data.prompt.content
              }
            : p
        ))
      } else {
        // Create new prompt
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: promptData.title,
            content: promptData.content,
            isGlobal: promptData.isGlobal || false
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create prompt')
        }

        const data = await response.json()
        const newPrompt: Prompt = {
          id: data.prompt.id,
          title: data.prompt.title,
          content: data.prompt.content,
          isGlobal: data.prompt.isGlobal,
          createdAt: data.prompt.createdAt,
          updatedAt: data.prompt.updatedAt,
          usageCount: 0,
          previewText: data.prompt.content.length > 80
            ? data.prompt.content.substring(0, 80) + '...'
            : data.prompt.content
        }
        setPrompts(prev => [newPrompt, ...prev])
      }
      setShowEditor(false)
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Failed to save prompt. Please try again.')
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    setOpenMenuId(null)
    if (confirm('Delete this prompt? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/prompts/${promptId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to delete prompt')
        }

        setPrompts(prev => prev.filter(p => p.id !== promptId))
      } catch (error) {
        console.error('Error deleting prompt:', error)
        alert('Failed to delete prompt. Please try again.')
      }
    }
  }

  const handleDuplicatePrompt = async (prompt: Prompt) => {
    setOpenMenuId(null)
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${prompt.title} (Copy)`,
          content: prompt.content,
          isGlobal: prompt.isGlobal
        })
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate prompt')
      }

      const data = await response.json()
      const duplicatedPrompt: Prompt = {
        id: data.prompt.id,
        title: data.prompt.title,
        content: data.prompt.content,
        isGlobal: data.prompt.isGlobal,
        createdAt: data.prompt.createdAt,
        updatedAt: data.prompt.updatedAt,
        usageCount: 0,
        previewText: data.prompt.content.length > 80
          ? data.prompt.content.substring(0, 80) + '...'
          : data.prompt.content
      }
      setPrompts(prev => [duplicatedPrompt, ...prev])
    } catch (error) {
      console.error('Error duplicating prompt:', error)
      alert('Failed to duplicate prompt. Please try again.')
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Prompts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage AI summarization prompts for different types of content
            </p>
          </div>

          <button
            onClick={handleCreatePrompt}
            className="mt-4 sm:mt-0 inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all shadow-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Prompt
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <span>{prompts.length} total prompts</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{prompts.filter(p => p.isGlobal).length} global</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{prompts.reduce((acc, p) => acc + p.usageCount, 0)} total uses</span>
        </div>
      </div>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create your first prompt</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Customize how AI summarizes your articles. Create different prompts for different types of content like tech news, policy updates, or research papers.
          </p>
          <button
            onClick={handleCreatePrompt}
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Prompt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="card-hover bg-white rounded-2xl shadow-sm p-6 relative group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    prompt.isGlobal
                      ? 'bg-blue-50'
                      : 'bg-gray-50'
                  }`}>
                    {prompt.isGlobal ? (
                      <GlobeAltIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    prompt.isGlobal
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {prompt.isGlobal ? 'Global' : 'Personal'}
                  </span>
                </div>

                <div className="relative">
                  <button
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === prompt.id ? null : prompt.id)
                    }}
                  >
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>

                  {/* Dropdown backdrop overlay */}
                  {openMenuId === prompt.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                        <button
                          onClick={() => handleEditPrompt(prompt)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-400" />
                          Edit Prompt
                        </button>
                        <button
                          onClick={() => handleDuplicatePrompt(prompt)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                          Duplicate
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button
                          onClick={() => handleDeletePrompt(prompt.id)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{prompt.title}</h3>

              <p className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">
                {prompt.previewText}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-5">
                <span>Used {formatUsage(prompt.usageCount)}</span>
                <span>Updated {formatDate(prompt.updatedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditPrompt(prompt)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>

                <button
                  onClick={() => handleDuplicatePrompt(prompt)}
                  className="p-2 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  title="Duplicate"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
                  title="Delete"
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
