import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = await getPrisma()
    
    // Get user with subscriptions and recent articles
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { isActive: true },
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
                  take: 20,
                  include: {
                    summaries: {
                      where: { userId: session.user.id },
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
      return NextResponse.json({ articles: [], topSources: [] })
    }

    // Flatten articles from all subscriptions
    const articles = user.subscriptions.flatMap(sub => 
      sub.feed.articles.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt.toISOString(),
        feed: {
          title: sub.feed.title,
          url: sub.feed.url
        },
        summary: article.summaries[0] ? {
          content: article.summaries[0].content,
          prompt: article.summaries[0].prompt ? {
            title: article.summaries[0].prompt.title
          } : null
        } : null
      }))
    )

    // Top sources with unread counts
    const topSources = user.subscriptions.map(sub => ({
      id: sub.feed.id,
      title: sub.feed.title,
      url: sub.feed.siteUrl || sub.feed.url,
      description: sub.feed.description || '',
      unreadCount: sub.feed.articles.length
    }))

    return NextResponse.json({ 
      articles: articles.slice(0, 10), // Latest 10 for dashboard
      topSources: topSources.slice(0, 6) // Top 6 sources
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ articles: [], topSources: [] })
  }
}