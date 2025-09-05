import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

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
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                  },
                  orderBy: { publishedAt: 'desc' },
                  take: 10,
                  include: {
                    summary: {
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
      return NextResponse.json({ articles: [], stats: { totalFeeds: 0, totalArticles: 0 } })
    }

    const articles = user.subscriptions
      .flatMap(sub => sub.feed.articles)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)

    const stats = {
      totalFeeds: user.subscriptions.length,
      totalArticles: articles.length,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({ 
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        feed: {
          title: user.subscriptions.find(sub => sub.feedId === article.feedId)?.feed.title || 'Unknown',
          url: user.subscriptions.find(sub => sub.feedId === article.feedId)?.feed.url || ''
        },
        summary: article.summary ? {
          content: article.summary.content
        } : undefined
      })),
      stats
    })
  } catch (error) {
    console.error('Error generating digest preview:', error)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}