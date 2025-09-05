'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useRouter } from 'next/navigation'

export default function NewPromptPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    category: 'general'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        router.push('/prompts')
      } else {
        alert('Failed to create prompt')
      }
    } catch (error) {
      alert('Error creating prompt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-28 font-bold text-gray-900 mb-2">Create New Prompt</h1>
          <p className="text-gray-600">Create a custom prompt template for AI summaries</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Tech News Brief"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this prompt"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Template
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Enter your prompt template here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title.trim() || !formData.prompt.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-md transition-colors"
            >
              {saving ? 'Creating...' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}