import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
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
                  orderBy: { publishedAt: 'desc' },
                  include: {
                    summaries: {
                      include: { prompt: true },
                      take: 1
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
      return NextResponse.json({ articles: [] })
    }

    const articles = user.subscriptions
      .flatMap(sub => sub.feed.articles)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        feed: {
          title: user.subscriptions.find(sub => sub.feedId === article.feedId)?.feed.title || 'Unknown',
          url: user.subscriptions.find(sub => sub.feedId === article.feedId)?.feed.url || ''
        },
        summary: article.summaries[0] ? {
          content: article.summaries[0].content,
          prompt: article.summaries[0].prompt ? {
            title: article.summaries[0].prompt.title
          } : undefined
        } : undefined
      }))

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}