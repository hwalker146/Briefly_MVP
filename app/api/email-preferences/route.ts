import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const preference = await prisma.emailPreference.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(preference)
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { sendTime, timezone, isActive } = await request.json()
    
    if (!sendTime || !timezone) {
      return NextResponse.json({ error: 'Send time and timezone are required' }, { status: 400 })
    }

    const preference = await prisma.emailPreference.upsert({
      where: { userId: session.user.id },
      update: {
        sendTime: new Date(sendTime),
        timezone,
        isActive: isActive ?? true,
      },
      create: {
        userId: session.user.id,
        sendTime: new Date(sendTime),
        timezone,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(preference)
  } catch (error) {
    console.error('Error updating email preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}