import { NextResponse } from 'next/server'
import { scheduleFeedPolling } from '@/lib/queue-dev'

export async function POST() {
  try {
    await scheduleFeedPolling()
    return NextResponse.json({ success: true, message: 'Feed polling scheduled' })
  } catch (error) {
    console.error('Error scheduling feed polling:', error)
    return NextResponse.json({ error: 'Failed to schedule feeds' }, { status: 500 })
  }
}