'use client'

import { useState } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline'

interface TimezoneOption {
  value: string
  label: string
  offset: string
  city: string
}

interface TimezonePickerProps {
  value: string
  onChange: (timezone: string) => void
}

const TIMEZONES: TimezoneOption[] = [
  { value: 'America/New_York', label: 'Eastern Time', offset: 'UTC-5', city: 'New York' },
  { value: 'America/Chicago', label: 'Central Time', offset: 'UTC-6', city: 'Chicago' },
  { value: 'America/Denver', label: 'Mountain Time', offset: 'UTC-7', city: 'Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time', offset: 'UTC-8', city: 'Los Angeles' },
  { value: 'America/Anchorage', label: 'Alaska Time', offset: 'UTC-9', city: 'Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time', offset: 'UTC-10', city: 'Honolulu' },
  { value: 'Europe/London', label: 'Greenwich Mean Time', offset: 'UTC+0', city: 'London' },
  { value: 'Europe/Paris', label: 'Central European Time', offset: 'UTC+1', city: 'Paris' },
  { value: 'Europe/Berlin', label: 'Central European Time', offset: 'UTC+1', city: 'Berlin' },
  { value: 'Europe/Rome', label: 'Central European Time', offset: 'UTC+1', city: 'Rome' },
  { value: 'Europe/Madrid', label: 'Central European Time', offset: 'UTC+1', city: 'Madrid' },
  { value: 'Europe/Amsterdam', label: 'Central European Time', offset: 'UTC+1', city: 'Amsterdam' },
  { value: 'Europe/Stockholm', label: 'Central European Time', offset: 'UTC+1', city: 'Stockholm' },
  { value: 'Europe/Helsinki', label: 'Eastern European Time', offset: 'UTC+2', city: 'Helsinki' },
  { value: 'Europe/Athens', label: 'Eastern European Time', offset: 'UTC+2', city: 'Athens' },
  { value: 'Europe/Moscow', label: 'Moscow Time', offset: 'UTC+3', city: 'Moscow' },
  { value: 'Asia/Dubai', label: 'Gulf Time', offset: 'UTC+4', city: 'Dubai' },
  { value: 'Asia/Karachi', label: 'Pakistan Time', offset: 'UTC+5', city: 'Karachi' },
  { value: 'Asia/Kolkata', label: 'India Standard Time', offset: 'UTC+5:30', city: 'Mumbai' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Time', offset: 'UTC+6', city: 'Dhaka' },
  { value: 'Asia/Bangkok', label: 'Indochina Time', offset: 'UTC+7', city: 'Bangkok' },
  { value: 'Asia/Singapore', label: 'Singapore Time', offset: 'UTC+8', city: 'Singapore' },
  { value: 'Asia/Shanghai', label: 'China Standard Time', offset: 'UTC+8', city: 'Shanghai' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time', offset: 'UTC+8', city: 'Hong Kong' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time', offset: 'UTC+9', city: 'Seoul' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time', offset: 'UTC+9', city: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time', offset: 'UTC+10', city: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time', offset: 'UTC+10', city: 'Melbourne' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time', offset: 'UTC+12', city: 'Auckland' }
]

export function TimezonePicker({ value, onChange }: TimezonePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedTimezone = TIMEZONES.find(tz => tz.value === value) || TIMEZONES[0]

  const filteredTimezones = TIMEZONES.filter(timezone => 
    timezone.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    timezone.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    timezone.offset.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCurrentTime = (timezone: string) => {
    const now = new Date()
    return now.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-sm font-medium truncate">{selectedTimezone.city}</div>
            <div className="text-xs text-gray-500 truncate">{selectedTimezone.offset}</div>
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search timezones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Timezone List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredTimezones.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No timezones found
                </div>
              ) : (
                filteredTimezones.map((timezone) => (
                  <button
                    key={timezone.value}
                    onClick={() => {
                      onChange(timezone.value)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                      timezone.value === value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{timezone.city}</div>
                        <div className="text-xs text-gray-500">{timezone.label}</div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{timezone.offset}</div>
                        <div>{getCurrentTime(timezone.value)}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}