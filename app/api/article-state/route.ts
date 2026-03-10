import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET - Get read status for multiple articles
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const articleIds = searchParams.get('ids')?.split(',').filter(Boolean)

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ states: {} })
    }

    const states = await prisma.articleState.findMany({
      where: {
        userId: user.id,
        ...(articleIds && { articleId: { in: articleIds } })
      },
      select: {
        articleId: true,
        isRead: true,
        readAt: true
      }
    })

    // Convert to map for easy lookup
    const stateMap: Record<string, { isRead: boolean; readAt: string | null }> = {}
    states.forEach(state => {
      stateMap[state.articleId] = {
        isRead: state.isRead,
        readAt: state.readAt?.toISOString() || null
      }
    })

    return NextResponse.json({ states: stateMap })

  } catch (error) {
    console.error('Error fetching article states:', error)
    return NextResponse.json({ error: 'Failed to fetch article states' }, { status: 500 })
  }
}

// POST - Mark article as read/unread
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleId, isRead } = await request.json()
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Upsert the article state
    const state = await prisma.articleState.upsert({
      where: {
        userId_articleId: { userId: user.id, articleId }
      },
      update: {
        isRead: isRead ?? true,
        readAt: isRead ?? true ? new Date() : null
      },
      create: {
        userId: user.id,
        articleId,
        isRead: isRead ?? true,
        readAt: isRead ?? true ? new Date() : null
      }
    })

    return NextResponse.json({
      state: {
        articleId: state.articleId,
        isRead: state.isRead,
        readAt: state.readAt?.toISOString() || null
      }
    })

  } catch (error) {
    console.error('Error updating article state:', error)
    return NextResponse.json({ error: 'Failed to update article state' }, { status: 500 })
  }
}

// PATCH - Mark multiple articles as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleIds, isRead } = await request.json()
    if (!articleIds || !Array.isArray(articleIds)) {
      return NextResponse.json({ error: 'Article IDs array required' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or update states for all articles
    const now = new Date()
    await Promise.all(
      articleIds.map(articleId =>
        prisma.articleState.upsert({
          where: {
            userId_articleId: { userId: user.id, articleId }
          },
          update: {
            isRead: isRead ?? true,
            readAt: isRead ?? true ? now : null
          },
          create: {
            userId: user.id,
            articleId,
            isRead: isRead ?? true,
            readAt: isRead ?? true ? now : null
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: articleIds.length
    })

  } catch (error) {
    console.error('Error updating article states:', error)
    return NextResponse.json({ error: 'Failed to update article states' }, { status: 500 })
  }
}
