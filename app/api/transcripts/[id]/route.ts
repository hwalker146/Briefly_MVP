import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/transcripts/[id] - Get a single transcript with segments and chat history
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const transcript = await prisma.transcript.findUnique({
      where: { id: params.id },
      include: {
        article: {
          include: {
            feed: {
              select: { title: true, url: true, siteUrl: true }
            }
          }
        },
        segments: {
          orderBy: { segmentIndex: 'asc' }
        },
        chats: {
          where: { userId: user.id },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: transcript.id,
      articleId: transcript.articleId,
      title: transcript.article.title,
      articleUrl: transcript.article.url,
      feedTitle: transcript.article.feed.title,
      feedUrl: transcript.article.feed.siteUrl || transcript.article.feed.url,
      publishedAt: transcript.article.publishedAt.toISOString(),
      duration: transcript.duration,
      wordCount: transcript.wordCount,
      speakerCount: transcript.speakerCount,
      language: transcript.language,
      fullText: transcript.fullText,
      status: transcript.status,
      segments: transcript.segments.map((s: any) => ({
        id: s.id,
        segmentIndex: s.segmentIndex,
        speaker: s.speaker,
        text: s.text,
        startTime: s.startTime,
        endTime: s.endTime
      })),
      chats: transcript.chats.map((c: any) => ({
        id: c.id,
        question: c.question,
        answer: c.answer,
        citations: JSON.parse(c.citations),
        createdAt: c.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
  }
}
