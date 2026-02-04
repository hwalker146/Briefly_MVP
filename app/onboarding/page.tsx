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

  const stepIndex = currentStep === 'welcome' || currentStep === 'add-feed' ? 0 : currentStep === 'set-time' ? 1 : 2

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-inter">
      <PageContainer>
        {/* Progress Bar */}
        <div className="mb-14">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              {/* Step 1 */}
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                stepIndex > 0
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50'
                  : stepIndex === 0
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50 ring-4 ring-indigo-100'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {stepIndex > 0 ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">1</span>
                )}
              </div>

              {/* Connector */}
              <div className="w-20 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out ${
                    stepIndex >= 1 ? 'w-full' : 'w-0'
                  }`}
                />
              </div>

              {/* Step 2 */}
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                stepIndex > 1
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50'
                  : stepIndex === 1
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50 ring-4 ring-indigo-100'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {stepIndex > 1 ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">2</span>
                )}
              </div>

              {/* Connector */}
              <div className="w-20 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out ${
                    stepIndex >= 2 ? 'w-full' : 'w-0'
                  }`}
                />
              </div>

              {/* Step 3 (complete) */}
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                stepIndex >= 2
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 ring-4 ring-emerald-100'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {stepIndex >= 2 ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">3</span>
                )}
              </div>
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center mt-3">
            <div className="flex items-center gap-3">
              <span className={`w-10 text-center text-xs font-medium ${stepIndex >= 0 ? 'text-indigo-600' : 'text-slate-400'}`}>Feed</span>
              <div className="w-20" />
              <span className={`w-10 text-center text-xs font-medium ${stepIndex >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>Time</span>
              <div className="w-20" />
              <span className={`w-10 text-center text-xs font-medium ${stepIndex >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>Done</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {currentStep === 'welcome' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200/50">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-28 font-bold text-slate-900 mb-4 tracking-tight">
                Welcome to Briefly!
              </h1>

              <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg mx-auto">
                Get your first AI-powered digest in just 2 minutes.
                We'll help you add a feed and set your perfect delivery time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center transition-all hover:shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-200/40">
                    <RssIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Add Your Feed</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Paste any website URL and we'll find the RSS feed automatically
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center transition-all hover:shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-sky-200/40">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Set Your Time</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Choose exactly when you want to receive your daily digest
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center transition-all hover:shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-200/40">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">AI Summaries</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Get intelligent summaries of your articles, delivered on schedule
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStep('add-feed')
                  setShowAddFeedModal(true)
                }}
                className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200/60 hover:-translate-y-0.5"
              >
                Add Your First Feed
              </button>
            </div>
          )}

          {currentStep === 'set-time' && !showTimeModal && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200/50">
                <CheckIcon className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-28 font-bold text-slate-900 mb-4 tracking-tight">
                Great! Feed Added Successfully
              </h2>

              {selectedFeed && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedFeed.favicon || `https://www.google.com/s2/favicons?domain=${new URL(selectedFeed.url).hostname}&sz=32`}
                      alt=""
                      className="w-8 h-8 rounded-lg"
                    />
                    <div className="text-left">
                      <h3 className="font-medium text-slate-900">{selectedFeed.title}</h3>
                      <p className="text-13 text-emerald-600 font-medium">Subscribed successfully</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-lg text-slate-500 mb-8">
                Now let's set when you'd like to receive your digest emails.
              </p>

              <button
                onClick={() => setShowTimeModal(true)}
                className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200/60 hover:-translate-y-0.5"
              >
                <ClockIcon className="w-5 h-5 mr-2" />
                Set Digest Time
              </button>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200/50">
                <CheckIcon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-28 font-bold text-slate-900 mb-4 tracking-tight">
                You're All Set!
              </h2>

              <p className="text-lg text-slate-500 mb-8">
                Your first digest is scheduled and will arrive{' '}
                {digestTime && (
                  <span className="font-semibold text-slate-900">
                    tomorrow at {digestTime.time}
                  </span>
                )}
                . You can always add more feeds and customize your preferences later.
              </p>

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-10">
                <h3 className="font-semibold text-slate-900 mb-5">What happens next?</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-600">We'll fetch the latest articles from your feed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-600">AI will generate personalized summaries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-600">Your digest will be delivered right on time</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishOnboarding}
                className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200/60 hover:-translate-y-0.5"
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
