import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailQueue } from '@/lib/queue-dev'

export async function POST() {
  try {
    const users = await prisma.user.findMany({
      where: {
        emailPreference: {
          isActive: true,
        },
        subscriptions: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        emailPreference: true,
        subscriptions: {
          where: { isActive: true },
          include: {
            feed: {
              include: {
                articles: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                    },
                  },
                  orderBy: { publishedAt: 'desc' },
                  include: {
                    summaries: true,
                  },
                },
              },
            },
            prompt: true,
          },
        },
      },
    })

    let digestsQueued = 0

    for (const user of users) {
      const articles = user.subscriptions
        .flatMap(sub => 
          sub.feed.articles.map(article => {
            const existingSummary = article.summaries.find(s => s.userId === user.id)
            return {
              id: article.id,
              title: article.title,
              url: article.url,
              summary: existingSummary?.content || article.description || 'No summary available',
              publishedAt: article.publishedAt.toISOString(),
              feedTitle: sub.feed.title || 'Unknown Feed',
            }
          })
        )
        .slice(0, 20) // Limit to 20 articles per digest

      if (articles.length > 0) {
        await emailQueue.add('send-digest', {
          userId: user.id,
          articles,
        })
        digestsQueued++
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${digestsQueued} digest emails queued` 
    })
  } catch (error) {
    console.error('Error triggering digest emails:', error)
    return NextResponse.json({ error: 'Failed to trigger digests' }, { status: 500 })
  }
}