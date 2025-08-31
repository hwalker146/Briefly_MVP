'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { AddFeedModal } from '@/components/onboarding/AddFeedModal'
import { TimePickerModal } from '@/components/onboarding/TimePickerModal'
import { CheckIcon, RssIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface FeedOption {
  url: string
  title: string
  description?: string
  favicon?: string
}

type OnboardingStep = 'welcome' | 'add-feed' | 'set-time' | 'complete'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [selectedFeed, setSelectedFeed] = useState<FeedOption | null>(null)
  const [digestTime, setDigestTime] = useState<{ time: string; timezone: string } | null>(null)
  const [showAddFeedModal, setShowAddFeedModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const router = useRouter()

  const handleFeedSelected = (feed: FeedOption) => {
    setSelectedFeed(feed)
    setShowAddFeedModal(false)
    setCurrentStep('set-time')
    setShowTimeModal(true)
  }

  const handleTimeSelected = (time: string, timezone: string) => {
    setDigestTime({ time, timezone })
    setShowTimeModal(false)
    setCurrentStep('complete')
  }

  const handleFinishOnboarding = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <PageContainer>
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep !== 'welcome' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {currentStep !== 'welcome' ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">1</span>
                )}
              </div>
              <div className={`w-16 h-0.5 ${currentStep === 'complete' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'complete' ? 'bg-indigo-600 text-white' : currentStep === 'set-time' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {currentStep === 'complete' ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">2</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {currentStep === 'welcome' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-8 h-8 text-indigo-600" />
              </div>
              
              <h1 className="text-28 font-bold text-gray-900 mb-4">
                Welcome to Briefly!
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get your first AI-powered digest in just 2 minutes. 
                We'll help you add a feed and set your perfect delivery time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <RssIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Add Your Feed</h3>
                  <p className="text-sm text-gray-600">
                    Paste any website URL and we'll find the RSS feed automatically
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Set Your Time</h3>
                  <p className="text-sm text-gray-600">
                    Choose exactly when you want to receive your daily digest
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Summaries</h3>
                  <p className="text-sm text-gray-600">
                    Get intelligent summaries of your articles, delivered on schedule
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStep('add-feed')
                  setShowAddFeedModal(true)
                }}
                className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Add Your First Feed
              </button>
            </div>
          )}

          {currentStep === 'set-time' && !showTimeModal && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-28 font-bold text-gray-900 mb-4">
                Great! Feed Added Successfully
              </h2>
              
              {selectedFeed && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedFeed.favicon || `https://www.google.com/s2/favicons?domain=${new URL(selectedFeed.url).hostname}&sz=32`}
                      alt=""
                      className="w-8 h-8 rounded"
                    />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">{selectedFeed.title}</h3>
                      <p className="text-13 text-gray-600">Subscribed successfully</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-lg text-gray-600 mb-8">
                Now let's set when you'd like to receive your digest emails.
              </p>

              <button
                onClick={() => setShowTimeModal(true)}
                className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <ClockIcon className="w-5 h-5 mr-2" />
                Set Digest Time
              </button>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckIcon className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-28 font-bold text-gray-900 mb-4">
                You're All Set! 🎉
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Your first digest is scheduled and will arrive{' '}
                {digestTime && (
                  <span className="font-semibold text-gray-900">
                    tomorrow at {digestTime.time}
                  </span>
                )}
                . You can always add more feeds and customize your preferences later.
              </p>

              <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-indigo-900 mb-4">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-indigo-800">We'll fetch the latest articles from your feed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-indigo-800">AI will generate personalized summaries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-indigo-800">Your digest will be delivered right on time</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishOnboarding}
                className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </PageContainer>

      <AddFeedModal
        isOpen={showAddFeedModal}
        onClose={() => setShowAddFeedModal(false)}
        onFeedSelected={handleFeedSelected}
      />

      <TimePickerModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        onTimeSelected={handleTimeSelected}
      />
    </div>
  )
}