'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DigestPreview } from '@/components/digest/DigestPreview'
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function DigestPreviewPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [digestData, setDigestData] = useState<any>(null)

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
      const response = await fetch('/api/digest/send-test', { method: 'POST' })
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
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Digest Preview</h1>
            <p className="text-sm text-gray-500 mt-1">Preview how your daily digest will look</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleSendTest}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm transition-all"
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Send Test Email
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {digestData ? (
          <DigestPreview digestData={digestData} />
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">No digest data available. Try refreshing.</p>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
