import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// Get read states for articles
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const articleIds = searchParams.get('articleIds')?.split(',').filter(Boolean)

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
      }
    })

    // Return as a map of articleId -> state
    const stateMap: Record<string, { isRead: boolean; readAt: Date | null }> = {}
    for (const state of states) {
      stateMap[state.articleId] = {
        isRead: state.isRead,
        readAt: state.readAt,
      }
    }

    return NextResponse.json({ states: stateMap })

  } catch (error) {
    console.error('Article states fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch article states' }, { status: 500 })
  }
}

// Mark article as read/unread
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
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

    const readValue = isRead !== false // Default to true
    const state = await prisma.articleState.upsert({
      where: { userId_articleId: { userId: user.id, articleId } },
      update: {
        isRead: readValue,
        readAt: readValue ? new Date() : null,
      },
      create: {
        userId: user.id,
        articleId,
        isRead: readValue,
        readAt: readValue ? new Date() : null,
      }
    })

    return NextResponse.json({ state })

  } catch (error) {
    console.error('Article state update error:', error)
    return NextResponse.json({ error: 'Failed to update article state' }, { status: 500 })
  }
}

// Mark multiple articles as read (batch operation)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleIds, isRead, feedId, olderThan } = await request.json()

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const readValue = isRead !== false
    let updatedCount = 0

    if (articleIds && Array.isArray(articleIds)) {
      // Mark specific articles
      for (const articleId of articleIds) {
        await prisma.articleState.upsert({
          where: { userId_articleId: { userId: user.id, articleId } },
          update: { isRead: readValue, readAt: readValue ? new Date() : null },
          create: { userId: user.id, articleId, isRead: readValue, readAt: readValue ? new Date() : null }
        })
        updatedCount++
      }
    } else if (feedId) {
      // Mark all articles in a feed as read
      const articles = await prisma.article.findMany({
        where: {
          feedId,
          ...(olderThan && { publishedAt: { lte: new Date(olderThan) } })
        },
        select: { id: true }
      })

      for (const article of articles) {
        await prisma.articleState.upsert({
          where: { userId_articleId: { userId: user.id, articleId: article.id } },
          update: { isRead: readValue, readAt: readValue ? new Date() : null },
          create: { userId: user.id, articleId: article.id, isRead: readValue, readAt: readValue ? new Date() : null }
        })
        updatedCount++
      }
    }

    return NextResponse.json({ success: true, updatedCount })

  } catch (error) {
    console.error('Batch article state update error:', error)
    return NextResponse.json({ error: 'Failed to update article states' }, { status: 500 })
  }
}
