import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET /api/email-preferences - Get user's email preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { emailPreference: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return existing preferences or defaults
    const preferences = user.emailPreference || {
      sendTime: new Date('1970-01-01T09:00:00Z'), // Default 9 AM UTC
      timezone: 'America/New_York',
      isActive: true,
      frequency: 'DAILY',
      lastSentAt: null,
      nextSendAt: null,
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// POST /api/email-preferences - Create or update email preferences
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sendTime, timezone, isActive, frequency } = body

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse sendTime if provided as string
    let parsedSendTime: Date | undefined
    if (sendTime) {
      if (typeof sendTime === 'string') {
        // Handle time string like "09:00" - convert to Date
        const [hours, minutes] = sendTime.split(':').map(Number)
        parsedSendTime = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0))
      } else {
        parsedSendTime = new Date(sendTime)
      }
    }

    // Calculate next send time
    const { calculateNextSendTime } = await import('@/lib/scheduler')
    const nextSendAt = parsedSendTime ? calculateNextSendTime(
      parsedSendTime,
      timezone || 'America/New_York',
      frequency || 'DAILY',
      null
    ) : undefined

    // Upsert email preferences
    const preferences = await prisma.emailPreference.upsert({
      where: { userId: user.id },
      update: {
        ...(parsedSendTime && { sendTime: parsedSendTime }),
        ...(timezone && { timezone }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(frequency && { frequency }),
        ...(nextSendAt && { nextSendAt }),
      },
      create: {
        userId: user.id,
        sendTime: parsedSendTime || new Date('1970-01-01T09:00:00Z'),
        timezone: timezone || 'America/New_York',
        isActive: isActive !== false,
        frequency: frequency || 'DAILY',
        nextSendAt,
      }
    })

    return NextResponse.json({ preferences, message: 'Preferences saved successfully' })
  } catch (error) {
    console.error('Error saving email preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
