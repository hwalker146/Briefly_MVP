import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { sendEmail, generateDigestHTML } from '@/lib/email'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

export async function POST() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = await getPrisma()
    
    // Get user's recent articles with summaries
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          include: {
            feed: {
              include: {
                articles: {
                  where: {
                    publishedAt: {
                      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                  },
                  orderBy: { publishedAt: 'desc' },
                  take: 5,
                  include: {
                    summaries: {
                      where: { userId: user?.id },
                      include: { prompt: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Flatten articles from all feeds
    const articles = user.subscriptions
      .flatMap(sub => sub.feed.articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt.toISOString(),
        feed: {
          title: sub.feed.title || 'Unknown Feed'
        },
        summary: article.summaries[0] ? {
          content: article.summaries[0].content
        } : undefined
      })))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5)

    const digestHTML = generateDigestHTML({
      articles,
      userEmail: user.email,
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    })

    await sendEmail({
      to: user.email,
      subject: `Your Briefly Digest - ${new Date().toLocaleDateString()}`,
      html: digestHTML
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Test digest sent successfully',
      articlesIncluded: articles.length
    })
  } catch (error) {
    console.error('Error sending test digest:', error)
    return NextResponse.json({ 
      error: 'Failed to send digest',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}