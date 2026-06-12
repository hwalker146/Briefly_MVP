import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET /api/subscriptions/[id] - Get a single subscription
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const prisma = await getPrisma()

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        feed: true,
        category: true,
        prompt: true,
        user: { select: { email: true } }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

// PATCH /api/subscriptions/[id] - Update subscription (pause/activate, change category, change prompt)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { isActive, categoryId, promptId } = body

    const prisma = await getPrisma()

    // Verify ownership
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update subscription
    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(promptId !== undefined && { promptId: promptId || null }),
      },
      include: {
        feed: true,
        category: true,
        prompt: true,
      }
    })

    return NextResponse.json({ subscription: updated })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}

// DELETE /api/subscriptions/[id] - Unsubscribe from a feed
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const prisma = await getPrisma()

    // Verify ownership
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.subscription.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
