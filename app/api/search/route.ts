import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all' // 'articles', 'feeds', 'transcripts', 'all'
    const feedId = searchParams.get('feedId')
    const categoryId = searchParams.get('categoryId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    const prisma = await getPrisma()

    // Get user to verify access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { isActive: true },
          select: { feedId: true, categoryId: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscribedFeedIds = user.subscriptions.map(s => s.feedId)

    // Build search pattern (case-insensitive contains)
    const searchPattern = `%${query}%`

    const results: {
      articles: unknown[]
      feeds: unknown[]
      transcripts: unknown[]
    } = {
      articles: [],
      feeds: [],
      transcripts: [],
    }

    // Search articles
    if (type === 'articles' || type === 'all') {
      const articleWhere: Record<string, unknown> = {
        feedId: { in: subscribedFeedIds },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { fullText: { contains: query, mode: 'insensitive' } },
        ],
      }

      if (feedId && subscribedFeedIds.includes(feedId)) {
        articleWhere.feedId = feedId
      }

      if (categoryId) {
        const categoryFeedIds = user.subscriptions
          .filter(s => s.categoryId === categoryId)
          .map(s => s.feedId)
        articleWhere.feedId = { in: categoryFeedIds }
      }

      const articles = await prisma.article.findMany({
        where: articleWhere,
        include: {
          feed: { select: { title: true, siteUrl: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      })

      results.articles = articles.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description?.slice(0, 200),
        url: a.url,
        publishedAt: a.publishedAt,
        feed: a.feed,
        type: 'article',
      }))
    }

    // Search feeds
    if (type === 'feeds' || type === 'all') {
      const feeds = await prisma.feedSource.findMany({
        where: {
          id: { in: subscribedFeedIds },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { url: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        skip: offset,
      })

      results.feeds = feeds.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description?.slice(0, 200),
        url: f.url,
        siteUrl: f.siteUrl,
        type: 'feed',
      }))
    }

    // Search transcripts
    if (type === 'transcripts' || type === 'all') {
      const transcripts = await prisma.transcript.findMany({
        where: {
          article: { feedId: { in: subscribedFeedIds } },
          OR: [
            { fullText: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              feed: { select: { title: true } }
            }
          },
          segments: {
            where: {
              text: { contains: query, mode: 'insensitive' }
            },
            take: 3,
          }
        },
        take: limit,
        skip: offset,
      })

      results.transcripts = transcripts.map(t => ({
        id: t.id,
        articleId: t.article.id,
        articleTitle: t.article.title,
        feedTitle: t.article.feed.title,
        wordCount: t.wordCount,
        duration: t.duration,
        matchingSegments: t.segments.map(s => ({
          text: s.text.slice(0, 150),
          startTime: s.startTime,
        })),
        type: 'transcript',
      }))
    }

    // Calculate totals
    const totalResults = results.articles.length + results.feeds.length + results.transcripts.length

    return NextResponse.json({
      query,
      results,
      total: totalResults,
      limit,
      offset,
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
