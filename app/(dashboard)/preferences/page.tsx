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
  CheckIcon,
  FolderIcon,
  RssIcon
} from '@heroicons/react/24/outline'

interface DigestSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'never'
  time: string
  timezone: string
  weekdays?: string[]
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
  appearance: { theme: 'light' | 'dark' | 'system' }
  privacy: { analyticsEnabled: boolean; dataRetention: number }
  digestContent: { includeAll: boolean; categoryIds: string[]; feedIds: string[] }
}

interface Category {
  id: string
  name: string
  color: string
  feedCount: number
}

interface Subscription {
  id: string
  feed: { id: string; title: string }
  category?: { id: string; name: string } | null
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
    email: { digestEnabled: true, instantEnabled: false, marketingEnabled: true, securityEnabled: true },
    appearance: { theme: 'light' },
    privacy: { analyticsEnabled: true, dataRetention: 90 },
    digestContent: { includeAll: true, categoryIds: [], feedIds: [] }
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Fetch preferences on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefsRes, categoriesRes, subscriptionsRes] = await Promise.all([
          fetch('/api/email-preferences'),
          fetch('/api/categories'),
          fetch('/api/subscriptions')
        ])

        if (prefsRes.ok) {
          const data = await prefsRes.json()
          if (data.preferences) {
            const pref = data.preferences
            // Map API response to local state
            const time = pref.sendTime ? new Date(pref.sendTime).toISOString().slice(11, 16) : '09:00'
            setPreferences(prev => ({
              ...prev,
              schedule: {
                ...prev.schedule,
                enabled: pref.isActive ?? true,
                frequency: (pref.frequency?.toLowerCase() || 'daily') as 'daily' | 'weekly' | 'never',
                time,
                timezone: pref.timezone || prev.schedule.timezone,
              }
            }))
          }
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.categories || [])
        }

        if (subscriptionsRes.ok) {
          const data = await subscriptionsRes.json()
          setSubscriptions(data.subscriptions || [])
        }
      } catch (error) {
        console.error('Error fetching preferences:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [])

  const updateSchedule = (updates: Partial<DigestSchedule>) => {
    setPreferences(prev => ({ ...prev, schedule: { ...prev.schedule, ...updates } }))
  }

  const updateEmailPreferences = (updates: Partial<EmailPreferences>) => {
    setPreferences(prev => ({ ...prev, email: { ...prev.email, ...updates } }))
  }

  const updateAppearance = (theme: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({ ...prev, appearance: { ...prev.appearance, theme } }))
  }

  const updatePrivacy = (updates: Partial<typeof preferences.privacy>) => {
    setPreferences(prev => ({ ...prev, privacy: { ...prev.privacy, ...updates } }))
  }

  const updateDigestContent = (updates: Partial<typeof preferences.digestContent>) => {
    setPreferences(prev => ({ ...prev, digestContent: { ...prev.digestContent, ...updates } }))
  }

  const toggleCategory = (categoryId: string) => {
    const current = preferences.digestContent.categoryIds
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId]
    updateDigestContent({ categoryIds: updated, includeAll: false })
  }

  const toggleFeed = (feedId: string) => {
    const current = preferences.digestContent.feedIds
    const updated = current.includes(feedId)
      ? current.filter(id => id !== feedId)
      : [...current, feedId]
    updateDigestContent({ feedIds: updated, includeAll: false })
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
    if (digest <= now) digest.setDate(digest.getDate() + 1)
    return digest.toLocaleString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      timeZone: preferences.schedule.timezone
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Map frequency to API format
      const frequencyMap: Record<string, string> = {
        'daily': 'DAILY',
        'weekly': 'WEEKLY',
        'never': 'DAILY' // We'll use isActive=false for never
      }

      const res = await fetch('/api/email-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sendTime: preferences.schedule.time,
          timezone: preferences.schedule.timezone,
          isActive: preferences.schedule.enabled && preferences.schedule.frequency !== 'never',
          frequency: frequencyMap[preferences.schedule.frequency] || 'DAILY',
        })
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
      }`} style={{ width: '20px', height: '20px' }} />
    </button>
  )

  return (
    <PageContainer>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Preferences</h1>
          <p className="text-sm text-gray-500">Customize your digest schedule, notifications, and account settings</p>
        </div>

        <div className="space-y-6">
          {/* Digest Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Digest Schedule</h2>
                  <p className="text-sm text-gray-500">When you receive your summarized articles</p>
                </div>
              </div>

              {preferences.schedule.enabled && (
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <BellIcon className="w-4 h-4" />
                    <span>Next digest: <strong>{getNextDigestTime()}</strong></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Email Digest</h3>
                  <p className="text-xs text-gray-500">Receive regular summaries of your subscribed feeds</p>
                </div>
                <Toggle checked={preferences.schedule.enabled} onChange={(v) => updateSchedule({ enabled: v })} />
              </div>

              {preferences.schedule.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">Frequency</label>
                    <div className="flex gap-3">
                      {[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }].map(option => (
                        <label key={option.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                          preferences.schedule.frequency === option.value
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            value={option.value}
                            checked={preferences.schedule.frequency === option.value}
                            onChange={(e) => updateSchedule({ frequency: e.target.value as 'daily' | 'weekly' })}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {preferences.schedule.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2.5">Days of the week</label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map(day => (
                          <button
                            key={day.id}
                            onClick={() => handleWeekdayToggle(day.id)}
                            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
                              preferences.schedule.weekdays?.includes(day.id)
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="digest-time" className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Time</label>
                      <input
                        id="digest-time"
                        type="time"
                        value={preferences.schedule.time}
                        onChange={(e) => updateSchedule({ time: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
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

          {/* Digest Content */}
          {preferences.schedule.enabled && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center">
                    <RssIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Digest Content</h2>
                    <p className="text-sm text-gray-500">Choose which feeds to include in your digest</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Include all feeds</h3>
                    <p className="text-xs text-gray-500">Receive summaries from all your subscribed feeds</p>
                  </div>
                  <Toggle
                    checked={preferences.digestContent.includeAll}
                    onChange={(v) => updateDigestContent({ includeAll: v, categoryIds: [], feedIds: [] })}
                  />
                </div>

                {!preferences.digestContent.includeAll && (
                  <>
                    {categories.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2.5">
                          <FolderIcon className="w-4 h-4 inline mr-1.5" />
                          Include by Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => toggleCategory(cat.id)}
                              className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
                                preferences.digestContent.categoryIds.includes(cat.id)
                                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                              <span className="text-xs opacity-70">({cat.feedCount})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2.5">
                        <RssIcon className="w-4 h-4 inline mr-1.5" />
                        Include Individual Feeds
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                        {subscriptions.length === 0 ? (
                          <p className="text-sm text-gray-500 p-4 text-center">No feeds subscribed</p>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {subscriptions.map(sub => (
                              <label
                                key={sub.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={preferences.digestContent.feedIds.includes(sub.feed.id)}
                                  onChange={() => toggleFeed(sub.feed.id)}
                                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{sub.feed.title}</span>
                                {sub.category && (
                                  <span className="text-xs text-gray-400">({sub.category.name})</span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Email Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Email Notifications</h2>
                  <p className="text-sm text-gray-500">Control which emails you receive</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {([
                { key: 'digestEnabled' as keyof EmailPreferences, title: 'Digest emails', desc: 'Regular summaries of your subscribed content' },
                { key: 'instantEnabled' as keyof EmailPreferences, title: 'Breaking news alerts', desc: 'Immediate notifications for urgent articles' },
                { key: 'marketingEnabled' as keyof EmailPreferences, title: 'Product updates', desc: 'Feature announcements and tips' },
                { key: 'securityEnabled' as keyof EmailPreferences, title: 'Security alerts', desc: 'Account security and login notifications' }
              ]).map(option => (
                <div key={option.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{option.title}</h3>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                  <Toggle
                    checked={preferences.email[option.key] as boolean}
                    onChange={(v) => updateEmailPreferences({ [option.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl flex items-center justify-center">
                  <Cog6ToothIcon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Appearance</h2>
                  <p className="text-sm text-gray-500">Customize how the app looks</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Theme</label>
              <div className="flex gap-3">
                {[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }].map(option => (
                  <label key={option.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    preferences.appearance.theme === option.value
                      ? 'bg-violet-50 border-violet-200 text-violet-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      value={option.value}
                      checked={preferences.appearance.theme === option.value}
                      onChange={(e) => updateAppearance(e.target.value as 'light' | 'dark' | 'system')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Privacy & Data</h2>
                  <p className="text-sm text-gray-500">Control your data and privacy settings</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Usage Analytics</h3>
                  <p className="text-xs text-gray-500">Help us improve by sharing anonymous usage data</p>
                </div>
                <Toggle
                  checked={preferences.privacy.analyticsEnabled}
                  onChange={(v) => updatePrivacy({ analyticsEnabled: v })}
                />
              </div>
              <div>
                <label htmlFor="data-retention" className="block text-sm font-medium text-gray-700 mb-1.5">Data Retention Period</label>
                <select
                  id="data-retention"
                  value={preferences.privacy.dataRetention}
                  onChange={(e) => updatePrivacy({ dataRetention: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>6 months</option>
                  <option value={365}>1 year</option>
                </select>
                <p className="text-xs text-gray-400 mt-1.5">How long we keep your read articles and activity data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-sm transition-all ${
              saved
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
            } disabled:from-gray-300 disabled:to-gray-300`}
          >
            {loading ? (
              <div className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <CheckIcon className="w-4 h-4" />
            ) : null}
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </PageContainer>
  )
}
