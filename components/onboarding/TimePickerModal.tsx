'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'

interface TimePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onTimeSelected: (time: string, timezone: string) => void
}

export function TimePickerModal({ isOpen, onClose, onTimeSelected }: TimePickerModalProps) {
  const [selectedTime, setSelectedTime] = useState('08:00')
  const [selectedTimezone, setSelectedTimezone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Detect user's timezone
  useEffect(() => {
    if (isOpen && !selectedTimezone) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setSelectedTimezone(timezone)
    }
  }, [isOpen, selectedTimezone])

  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', 
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ]

  const commonTimezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ]

  const formatTimezone = (tz: string) => {
    const [continent, city] = tz.split('/')
    return `${city?.replace('_', ' ')} (${continent})`
  }

  const getTimezoneName = (tz: string) => {
    try {
      const now = new Date()
      const timeZoneName = now.toLocaleTimeString('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      }).split(' ')[2]
      return timeZoneName
    } catch {
      return ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    onTimeSelected(selectedTime, selectedTimezone)
    setIsSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Set Your Digest Time</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <ClockIcon className="w-4 h-4 inline mr-2" />
                When would you like to receive your daily digest?
              </label>
              
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedTime === time
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                  {formatTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)} - Detected
                </option>
                {commonTimezones
                  .filter(tz => tz !== Intl.DateTimeFormat().resolvedOptions().timeZone)
                  .map((tz) => (
                    <option key={tz} value={tz}>
                      {formatTimezone(tz)} {getTimezoneName(tz)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="text-sm text-indigo-700">
                <strong>Preview:</strong> Your next digest will arrive at{' '}
                <span className="font-semibold">
                  {selectedTime} {getTimezoneName(selectedTimezone)}
                </span>
                {' '}tomorrow morning.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-md transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save and Finish'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}