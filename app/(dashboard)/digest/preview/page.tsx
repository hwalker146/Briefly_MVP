'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DigestPreview } from '@/components/digest/DigestPreview'
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function DigestPreviewPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [digestData, setDigestData] = useState(null)

  useEffect(() => {
    fetchDigestPreview()
  }, [])

  const fetchDigestPreview = async () => {
    try {
      const response = await fetch('/api/digest/preview')
      if (response.ok) {
        const data = await response.json()
        setDigestData(data)
      }
    } catch (error) {
      console.error('Error fetching digest preview:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDigestPreview()
  }

  const handleSendTest = async () => {
    try {
      const response = await fetch('/api/digest/send-test', {
        method: 'POST'
      })
      if (response.ok) {
        alert('Test email sent!')
      } else {
        alert('Failed to send test email')
      }
    } catch (error) {
      alert('Error sending test email')
    }
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-28 font-bold text-gray-900">Digest Preview</h1>
            <p className="text-gray-600 mt-1">Preview how your daily digest will look</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleSendTest}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Send Test Email
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <DigestPreview data={digestData} />
      </div>
    </PageContainer>
  )
}