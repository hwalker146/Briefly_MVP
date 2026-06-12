import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

const getAnthropic = async () => {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

function verifyCronSecret(request: Request): boolean {
  const headersList = headers()
  const authHeader = headersList.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prisma = await getPrisma()
    const anthropic = await getAnthropic()
    const { sendEmail, generateDigestHTML } = await import('@/lib/email')

    // Get all users with active email preferences that are due
    const now = new Date()
    const users = await prisma.user.findMany({
      where: {
        emailPreference: {
          isActive: true,
          nextSendAt: { lte: now }
        }
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
                    publishedAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                  },
                  orderBy: { publishedAt: 'desc' },
                  take: 10,
                  include: {
                    summaries: { take: 1 }
                  }
                }
              }
            }
          }
        }
      }
    })

    const results = []

    for (const user of users) {
      const allArticles = user.subscriptions.flatMap(sub =>
        sub.feed.articles.map(article => ({
          id: article.id,
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt.toISOString(),
          summary: article.summaries[0] ? { content: article.summaries[0].content } : undefined,
          feed: { title: sub.feed.title || 'Unknown Feed' }
        }))
      ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

      if (allArticles.length === 0) continue

      const digestHTML = generateDigestHTML({
        articles: allArticles.slice(0, 10),
        userEmail: user.email,
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })

      try {
        await sendEmail({
          to: user.email,
          subject: `Your Briefly Digest - ${new Date().toLocaleDateString()}`,
          html: digestHTML
        })

        // Update next send time
        if (user.emailPreference) {
          const { calculateNextSendTime } = await import('@/lib/scheduler')
          const nextSendAt = calculateNextSendTime(
            user.emailPreference.sendTime,
            user.emailPreference.timezone,
            user.emailPreference.frequency,
            now
          )

          await prisma.emailPreference.update({
            where: { userId: user.id },
            data: { lastSentAt: now, nextSendAt }
          })
        }

        results.push({
          userId: user.id,
          email: user.email,
          articlesCount: allArticles.length,
          digestSent: true
        })
      } catch (emailError) {
        console.error(`Failed to send digest to ${user.email}:`, emailError)
        results.push({
          userId: user.id,
          email: user.email,
          error: emailError instanceof Error ? emailError.message : 'Email send failed'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${users.length} users, sent ${results.filter(r => r.digestSent).length} digests`,
      results
    })
  } catch (error) {
    console.error('Digest generation error:', error)
    return NextResponse.json({ error: 'Failed to generate digest' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return POST(request)
}
