import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/transcripts - List all transcripts for the user's subscribed feeds
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { isActive: true },
          select: { feedId: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const feedIds = user.subscriptions.map((s: any) => s.feedId)

    const transcripts = await prisma.transcript.findMany({
      where: {
        article: {
          feedId: { in: feedIds }
        },
        status: 'READY'
      },
      include: {
        article: {
          include: {
            feed: {
              select: { title: true, url: true, siteUrl: true }
            }
          }
        },
        _count: {
          select: { segments: true, chats: true }
        }
      },
      orderBy: {
        article: { publishedAt: 'desc' }
      },
      take: 50
    })

    return NextResponse.json({
      transcripts: transcripts.map((t: any) => ({
        id: t.id,
        articleId: t.articleId,
        title: t.article.title,
        feedTitle: t.article.feed.title,
        feedUrl: t.article.feed.siteUrl || t.article.feed.url,
        publishedAt: t.article.publishedAt.toISOString(),
        duration: t.duration,
        wordCount: t.wordCount,
        speakerCount: t.speakerCount,
        segmentCount: t._count.segments,
        chatCount: t._count.chats,
        status: t.status,
        createdAt: t.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching transcripts:', error)
    return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
  }
}

// POST /api/transcripts - Create a transcript (manual upload or from text)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { articleId, fullText, segments } = body

    if (!articleId || !fullText) {
      return NextResponse.json({ error: 'articleId and fullText are required' }, { status: 400 })
    }

    // Verify article exists and user has access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: { where: { isActive: true }, select: { feedId: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } })
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const wordCount = fullText.split(/\s+/).length
    const speakerCount = segments
      ? new Set(segments.filter((s: any) => s.speaker).map((s: any) => s.speaker)).size
      : 1

    // Create transcript with segments in a transaction
    const transcript = await prisma.transcript.create({
      data: {
        articleId,
        fullText,
        wordCount,
        speakerCount: speakerCount || 1,
        duration: article.duration,
        status: 'READY',
        segments: segments ? {
          create: segments.map((seg: any, index: number) => ({
            segmentIndex: index,
            speaker: seg.speaker || null,
            text: seg.text,
            startTime: seg.startTime || 0,
            endTime: seg.endTime || 0
          }))
        } : undefined
      },
      include: {
        segments: true
      }
    })

    return NextResponse.json({ transcript }, { status: 201 })
  } catch (error) {
    console.error('Error creating transcript:', error)
    return NextResponse.json({ error: 'Failed to create transcript' }, { status: 500 })
  }
}
