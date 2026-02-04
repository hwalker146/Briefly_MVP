'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, SparklesIcon, EyeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

interface Prompt {
  id?: string
  title: string
  content: string
  isGlobal: boolean
}

interface PromptEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (prompt: Prompt) => void
  prompt?: Prompt
}

const SAMPLE_ARTICLE = {
  title: "OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities",
  content: `OpenAI today unveiled GPT-5, the next generation of its flagship language model, featuring unprecedented reasoning capabilities. Key improvements include enhanced mathematical reasoning, better code generation, and more accurate fact-checking. In tests, GPT-5 scored 92% on MATH benchmarks vs GPT-4's 76%. The model introduces "chain-of-thought" reasoning for transparency. OpenAI CEO Sam Altman stated it represents "the beginning of artificial general intelligence," with developer API access coming next month.`
}

export function PromptEditor({ isOpen, onClose, onSave, prompt }: PromptEditorProps) {
  const [formData, setFormData] = useState<Prompt>({
    title: '',
    content: '',
    isGlobal: false
  })
  const [preview, setPreview] = useState('')
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)

  useEffect(() => {
    if (prompt) {
      setFormData(prompt)
    } else {
      setFormData({ title: '', content: '', isGlobal: false })
    }
  }, [prompt, isOpen])

  useEffect(() => {
    const tokens = Math.ceil((formData.content + SAMPLE_ARTICLE.content).length / 4)
    setTokenCount(tokens)
  }, [formData.content])

  const generatePreview = async () => {
    if (!formData.content.trim()) {
      setPreview('Enter a prompt to see the preview')
      return
    }
    setIsGeneratingPreview(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setPreview(generateMockSummary(formData.content))
    } catch {
      setPreview('Error generating preview. Please try again.')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const generateMockSummary = (promptContent: string): string => {
    const p = promptContent.toLowerCase()
    if (p.includes('bullet') || p.includes('point')) {
      return `• OpenAI released GPT-5 with major improvements in reasoning, scoring 92% on MATH benchmark vs GPT-4's 76%\n• New "chain-of-thought" feature shows step-by-step reasoning process, addressing AI transparency concerns\n• Model launches to developers next month, with enhanced code generation and fact-checking capabilities`
    }
    if (p.includes('policy') || p.includes('implication')) {
      return `GPT-5's release signals accelerated AI development competition among tech giants. The transparency features may address regulatory concerns about AI explainability. Key stakeholders include developers gaining API access next month, professionals in affected industries, and policymakers evaluating AI safety measures.`
    }
    if (p.includes('brief') || p.includes('short') || p.includes('sentence')) {
      return `OpenAI unveiled GPT-5 with 92% MATH benchmark performance and new reasoning transparency features. The model launches to developers next month amid intensifying AI industry competition.`
    }
    return `OpenAI announced GPT-5, featuring revolutionary reasoning capabilities with 92% on mathematical benchmarks compared to GPT-4's 76%. The model introduces "chain-of-thought" reasoning for transparency and will be available to developers next month, marking what CEO Sam Altman calls "the beginning of artificial general intelligence."`
  }

  useEffect(() => {
    if (formData.content.trim()) {
      const debounceTimer = setTimeout(generatePreview, 800)
      return () => clearTimeout(debounceTimer)
    } else {
      setPreview('')
    }
  }, [formData.content])

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) return
    onSave(formData)
    onClose()
  }

  const insertTemplate = (template: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + (prev.content ? '\n\n' : '') + template
    }))
  }

  const templates = [
    { name: 'Bullet Points', content: 'Summarize this article in 3-5 bullet points, focusing on the most important facts and outcomes.' },
    { name: 'Executive Summary', content: 'Provide an executive summary in 2-3 paragraphs, highlighting key decisions, impacts, and next steps.' },
    { name: 'Technical Analysis', content: 'Focus on technical details, methodologies, and implementation aspects. Include relevant metrics and specifications.' },
    { name: 'Business Impact', content: 'Analyze the business implications, market effects, and strategic significance. Include potential risks and opportunities.' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex h-full">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white shadow-2xl flex flex-col w-full max-w-4xl ml-auto rounded-l-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {prompt ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Customize how AI summarizes articles from your feeds
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Editor */}
            <div className="flex-1 flex flex-col p-6 border-r border-gray-100">
              <div className="space-y-5 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Prompt Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Tech News Brief"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Scope
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={!formData.isGlobal}
                          onChange={() => setFormData(prev => ({ ...prev, isGlobal: false }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Personal</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.isGlobal}
                          onChange={() => setFormData(prev => ({ ...prev, isGlobal: true }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Global</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Templates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Quick Templates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => insertTemplate(template.content)}
                        className="text-left p-2.5 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-colors font-medium"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Prompt Instructions
                    </label>
                    <span className="text-xs text-gray-400">
                      ~{tokenCount} tokens
                    </span>
                  </div>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder='Example: Summarize in 5 bullet points, highlight numbers and policy actions, finish with "Why it matters" one liner.'
                    rows={10}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm leading-relaxed"
                  />
                  <div className="mt-1.5 text-xs text-gray-400">
                    Tip: Be specific about format, length, and focus areas for best results.
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  Cost estimate: ~$0.002 per article
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.title.trim() || !formData.content.trim()}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 rounded-xl shadow-sm transition-all"
                  >
                    Save Prompt
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-96 flex flex-col bg-gray-50/50">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <EyeIcon className="w-4 h-4 text-gray-500" />
                  Live Preview
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  See how your prompt works with a sample article
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sample Article</h4>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">{SAMPLE_ARTICLE.title}</h5>
                    <p className="text-xs text-gray-500 line-clamp-4 leading-relaxed">{SAMPLE_ARTICLE.content}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Generated Summary</h4>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 min-h-[180px]">
                    {isGeneratingPreview ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      </div>
                    ) : preview ? (
                      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{preview}</div>
                    ) : (
                      <div className="text-xs text-gray-400 italic py-8 text-center">
                        Enter prompt instructions to see preview
                      </div>
                    )}
                  </div>
                </div>

                {preview && !isGeneratingPreview && (
                  <button
                    onClick={() => navigator.clipboard.writeText(preview)}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                  >
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                    Copy summary
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
