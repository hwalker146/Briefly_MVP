import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET /api/subscriptions - List all user's subscriptions
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          include: {
            feed: true,
            category: true,
            prompt: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ subscriptions: [] })
    }

    return NextResponse.json({ subscriptions: user.subscriptions })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

// POST /api/subscriptions - Create a new subscription to a feed
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { feedId } = body

    if (!feedId) {
      return NextResponse.json({ error: 'feedId is required' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if feed exists
    const feed = await prisma.feedSource.findUnique({
      where: { id: feedId }
    })

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 })
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_feedId: {
          userId: user.id,
          feedId: feedId
        }
      }
    })

    if (existingSubscription) {
      return NextResponse.json({
        subscription: existingSubscription,
        message: 'Already subscribed to this feed'
      })
    }

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        feedId: feedId
      },
      include: {
        feed: true
      }
    })

    return NextResponse.json({
      subscription,
      message: 'Subscribed successfully'
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
