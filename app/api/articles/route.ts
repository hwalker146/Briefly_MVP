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
                  orderBy: { publishedAt: 'desc' },
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
        summary: article.summary ? {
          content: article.summary.content,
          prompt: article.summary.prompt ? {
            title: article.summary.prompt.title
          } : undefined
        } : undefined
      }))

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}