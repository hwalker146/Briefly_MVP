import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarizeArticle } from '@/lib/claude'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { articleId, promptId } = await request.json()
    
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        feed: {
          include: {
            subscriptions: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!article || article.feed.subscriptions.length === 0) {
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 })
    }

    // Check if summary already exists
    const existingSummary = await prisma.summary.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    if (existingSummary) {
      return NextResponse.json(existingSummary)
    }

    let prompt: string | undefined
    if (promptId) {
      const promptRecord = await prisma.prompt.findFirst({
        where: {
          id: promptId,
          OR: [
            { userId: session.user.id },
            { isGlobal: true },
          ],
        },
      })
      prompt = promptRecord?.content
    }

    const content = article.fullText || article.description || ''
    if (!content) {
      return NextResponse.json({ error: 'No content available to summarize' }, { status: 400 })
    }

    const summaryContent = await summarizeArticle(article.title, content, { prompt })

    const summary = await prisma.summary.create({
      data: {
        userId: session.user.id,
        articleId,
        content: summaryContent,
        promptId,
      },
    })

    return NextResponse.json(summary, { status: 201 })
  } catch (error) {
    console.error('Error creating summary:', error)
    return NextResponse.json({ error: 'Failed to create summary' }, { status: 500 })
  }
}