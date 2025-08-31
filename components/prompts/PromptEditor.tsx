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
  content: `OpenAI today unveiled GPT-5, the next generation of its flagship language model, featuring unprecedented reasoning capabilities that the company claims represent a significant leap forward in artificial intelligence. The new model, which has been in development for over two years, demonstrates improved performance across multiple benchmarks and introduces novel features for complex problem-solving.

Key improvements include enhanced mathematical reasoning, better code generation, and more accurate fact-checking capabilities. In preliminary tests, GPT-5 scored 92% on the MATH benchmark, compared to GPT-4's 76%, and achieved near-human performance on coding challenges.

The model also introduces "chain-of-thought" reasoning that allows users to see the step-by-step process behind complex answers. This transparency feature addresses one of the main criticisms of previous AI systems - their "black box" nature.

OpenAI CEO Sam Altman stated during the announcement that GPT-5 represents "the beginning of artificial general intelligence," though he cautioned that significant challenges remain. The company plans to make GPT-5 available to developers through its API starting next month, with consumer access following shortly after.

Industry experts have praised the advancement while raising questions about safety measures and the potential impact on various professions. The announcement comes as competition intensifies in the AI sector, with major tech companies racing to develop more powerful language models.`
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
      setFormData({
        title: '',
        content: '',
        isGlobal: false
      })
    }
  }, [prompt, isOpen])

  useEffect(() => {
    // Simple token estimation (rough approximation)
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
      // Mock AI response - in real app, this would call the preview API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockSummary = generateMockSummary(formData.content)
      setPreview(mockSummary)
    } catch (error) {
      setPreview('Error generating preview. Please try again.')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const generateMockSummary = (promptContent: string): string => {
    // Generate different mock summaries based on prompt keywords
    const prompt = promptContent.toLowerCase()
    
    if (prompt.includes('bullet') || prompt.includes('point')) {
      return `• OpenAI released GPT-5 with major improvements in reasoning, scoring 92% on MATH benchmark vs GPT-4's 76%
• New "chain-of-thought" feature shows step-by-step reasoning process, addressing AI transparency concerns  
• Model launches to developers next month, with enhanced code generation and fact-checking capabilities`
    }
    
    if (prompt.includes('policy') || prompt.includes('implication')) {
      return `GPT-5's release signals accelerated AI development competition among tech giants, potentially disrupting knowledge work sectors. The transparency features may address regulatory concerns about AI explainability. Key stakeholders include developers gaining API access next month, professionals in affected industries, and policymakers evaluating AI safety measures. Long-term effects include potential job displacement in analytical roles and increased demand for AI governance frameworks.`
    }
    
    if (prompt.includes('brief') || prompt.includes('short') || prompt.includes('sentence')) {
      return `OpenAI unveiled GPT-5 with 92% MATH benchmark performance and new reasoning transparency features. The model launches to developers next month amid intensifying AI industry competition.`
    }
    
    // Default summary
    return `OpenAI announced GPT-5, featuring revolutionary reasoning capabilities that represent a significant advancement in AI technology. The model achieved 92% on mathematical benchmarks compared to GPT-4's 76% and introduces "chain-of-thought" reasoning for transparency. With enhanced code generation and fact-checking abilities, GPT-5 will be available to developers next month, marking what CEO Sam Altman calls "the beginning of artificial general intelligence" while raising important questions about safety and industry impact.`
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
    {
      name: 'Bullet Points',
      content: 'Summarize this article in 3-5 bullet points, focusing on the most important facts and outcomes.'
    },
    {
      name: 'Executive Summary',
      content: 'Provide an executive summary in 2-3 paragraphs, highlighting key decisions, impacts, and next steps.'
    },
    {
      name: 'Technical Analysis',
      content: 'Focus on technical details, methodologies, and implementation aspects. Include relevant metrics and specifications.'
    },
    {
      name: 'Business Impact',
      content: 'Analyze the business implications, market effects, and strategic significance. Include potential risks and opportunities.'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex h-full">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white shadow-xl flex flex-col w-full max-w-4xl ml-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {prompt ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Customize how AI summarizes articles from your feeds
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Editor */}
            <div className="flex-1 flex flex-col p-6 border-r border-gray-200">
              <div className="space-y-6 flex-1">
                {/* Title and Scope */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Tech News Brief"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scope
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!formData.isGlobal}
                          onChange={() => setFormData(prev => ({ ...prev, isGlobal: false }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Personal</span>
                      </label>
                      <label className="flex items-center">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Templates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => insertTemplate(template.content)}
                        className="text-left p-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Prompt Instructions
                    </label>
                    <span className="text-13 text-gray-500">
                      ~{tokenCount} tokens
                    </span>
                  </div>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Example: Summarize in 5 bullet points, highlight numbers and policy actions, finish with 'Why it matters' one liner."
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                  />
                  <div className="mt-2 text-13 text-gray-500">
                    Tip: Be specific about format, length, and focus areas for best results.
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-13 text-gray-500">
                  Cost estimate: ~$0.002 per article
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.title.trim() || !formData.content.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-md transition-colors"
                  >
                    Save Prompt
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-96 flex flex-col bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <EyeIcon className="w-4 h-4" />
                  Live Preview
                </div>
                <p className="text-13 text-gray-500 mt-1">
                  See how your prompt works with a sample article
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Sample Article */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Article</h4>
                  <div className="bg-white rounded border border-gray-200 p-3">
                    <h5 className="font-medium text-gray-900 text-sm mb-2">{SAMPLE_ARTICLE.title}</h5>
                    <p className="text-13 text-gray-600 line-clamp-4">{SAMPLE_ARTICLE.content}</p>
                  </div>
                </div>

                {/* Generated Summary */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Summary</h4>
                  <div className="bg-white rounded border border-gray-200 p-3 min-h-[200px]">
                    {isGeneratingPreview ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : preview ? (
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{preview}</div>
                    ) : (
                      <div className="text-13 text-gray-500 italic py-8 text-center">
                        Enter prompt instructions to see preview
                      </div>
                    )}
                  </div>
                </div>

                {preview && !isGeneratingPreview && (
                  <button
                    onClick={() => navigator.clipboard.writeText(preview)}
                    className="mt-2 text-13 text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <DocumentDuplicateIcon className="w-3 h-3" />
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