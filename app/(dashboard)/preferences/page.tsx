'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { TimezonePicker } from '@/components/preferences/TimezonePicker'
import { 
  ClockIcon,
  BellIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  UserIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface DigestSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'never'
  time: string // HH:MM format
  timezone: string
  weekdays?: string[] // For weekly digest
}

interface EmailPreferences {
  digestEnabled: boolean
  instantEnabled: boolean
  marketingEnabled: boolean
  securityEnabled: boolean
}

interface UserPreferences {
  schedule: DigestSchedule
  email: EmailPreferences
  appearance: {
    theme: 'light' | 'dark' | 'system'
  }
  privacy: {
    analyticsEnabled: boolean
    dataRetention: number // days
  }
}

const WEEKDAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' }
]

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    schedule: {
      enabled: true,
      frequency: 'daily',
      time: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    email: {
      digestEnabled: true,
      instantEnabled: false,
      marketingEnabled: true,
      securityEnabled: true
    },
    appearance: {
      theme: 'light'
    },
    privacy: {
      analyticsEnabled: true,
      dataRetention: 90
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateSchedule = (updates: Partial<DigestSchedule>) => {
    setPreferences(prev => ({
      ...prev,
      schedule: { ...prev.schedule, ...updates }
    }))
  }

  const updateEmailPreferences = (updates: Partial<EmailPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      email: { ...prev.email, ...updates }
    }))
  }

  const updateAppearance = (theme: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({
      ...prev,
      appearance: { ...prev.appearance, theme }
    }))
  }

  const updatePrivacy = (updates: Partial<typeof preferences.privacy>) => {
    setPreferences(prev => ({
      ...prev,
      privacy: { ...prev.privacy, ...updates }
    }))
  }

  const handleWeekdayToggle = (weekday: string) => {
    const current = preferences.schedule.weekdays || []
    const updated = current.includes(weekday)
      ? current.filter(day => day !== weekday)
      : [...current, weekday]
    
    updateSchedule({ weekdays: updated })
  }

  const getNextDigestTime = () => {
    const now = new Date()
    const [hours, minutes] = preferences.schedule.time.split(':').map(Number)
    const digest = new Date()
    digest.setHours(hours, minutes, 0, 0)
    
    // If time has passed today, show tomorrow
    if (digest <= now) {
      digest.setDate(digest.getDate() + 1)
    }

    return digest.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: preferences.schedule.timezone
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-28 font-bold text-gray-900 mb-2">Preferences</h1>
          <p className="text-gray-600">
            Customize your digest schedule, notifications, and account settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Digest Schedule */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Digest Schedule</h2>
                  <p className="text-sm text-gray-600">When you receive your summarized articles</p>
                </div>
              </div>

              {preferences.schedule.enabled && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <BellIcon className="w-4 h-4" />
                    <span>Next digest: <strong>{getNextDigestTime()}</strong></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Digest</h3>
                  <p className="text-sm text-gray-600">Receive regular summaries of your subscribed feeds</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.schedule.enabled}
                    onChange={(e) => updateSchedule({ enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    preferences.schedule.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      preferences.schedule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`} />
                  </div>
                </label>
              </div>

              {preferences.schedule.enabled && (
                <>
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Frequency</label>
                    <div className="flex gap-3">
                      {[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            value={option.value}
                            checked={preferences.schedule.frequency === option.value}
                            onChange={(e) => updateSchedule({ frequency: e.target.value as any })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Days */}
                  {preferences.schedule.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Days of the week</label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map(day => (
                          <button
                            key={day.id}
                            onClick={() => handleWeekdayToggle(day.id)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              preferences.schedule.weekdays?.includes(day.id)
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="digest-time" className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Time
                      </label>
                      <input
                        id="digest-time"
                        type="time"
                        value={preferences.schedule.time}
                        onChange={(e) => updateSchedule({ time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <TimezonePicker
                        value={preferences.schedule.timezone}
                        onChange={(timezone) => updateSchedule({ timezone })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                  <p className="text-sm text-gray-600">Control which emails you receive</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[
                {
                  key: 'digestEnabled' as keyof EmailPreferences,
                  title: 'Digest emails',
                  description: 'Regular summaries of your subscribed content'
                },
                {
                  key: 'instantEnabled' as keyof EmailPreferences,
                  title: 'Breaking news alerts',
                  description: 'Immediate notifications for urgent articles'
                },
                {
                  key: 'marketingEnabled' as keyof EmailPreferences,
                  title: 'Product updates',
                  description: 'Feature announcements and tips'
                },
                {
                  key: 'securityEnabled' as keyof EmailPreferences,
                  title: 'Security alerts',
                  description: 'Account security and login notifications'
                }
              ].map(option => (
                <div key={option.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email[option.key] as boolean}
                      onChange={(e) => updateEmailPreferences({ [option.key]: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      preferences.email[option.key] ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.email[option.key] ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Cog6ToothIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                  <p className="text-sm text-gray-600">Customize how the app looks</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                <div className="flex gap-3">
                  {[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        checked={preferences.appearance.theme === option.value}
                        onChange={(e) => updateAppearance(e.target.value as any)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Privacy & Data</h2>
                  <p className="text-sm text-gray-600">Control your data and privacy settings</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Usage Analytics</h3>
                  <p className="text-sm text-gray-600">Help us improve by sharing anonymous usage data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.privacy.analyticsEnabled}
                    onChange={(e) => updatePrivacy({ analyticsEnabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    preferences.privacy.analyticsEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      preferences.privacy.analyticsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`} />
                  </div>
                </label>
              </div>

              <div>
                <label htmlFor="data-retention" className="block text-sm font-medium text-gray-700 mb-2">
                  Data Retention Period
                </label>
                <select
                  id="data-retention"
                  value={preferences.privacy.dataRetention}
                  onChange={(e) => updatePrivacy({ dataRetention: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>6 months</option>
                  <option value={365}>1 year</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  How long we keep your read articles and activity data
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-md transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : saved ? (
              <CheckIcon className="w-4 h-4 mr-2" />
            ) : null}
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </PageContainer>
  )
}