import { NextResponse } from 'next/server'

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

const getPostmark = async () => {
  const { ServerClient } = await import('postmark')
  return new ServerClient(process.env.POSTMARK_TOKEN!)
}

export async function POST() {
  try {
    const prisma = await getPrisma()
    const anthropic = await getAnthropic()
    const postmark = await getPostmark()
    
    // Get all users with active email preferences
    const users = await prisma.user.findMany({
      where: {
        emailPreference: {
          isActive: true
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
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                  },
                  orderBy: { publishedAt: 'desc' },
                  take: 10
                }
              }
            }
          }
        }
      }
    })

    const results = []
    
    for (const user of users) {
      // Collect all recent articles from user's subscriptions
      const allArticles = user.subscriptions.flatMap(sub => 
        sub.feed.articles.map(article => ({
          ...article,
          feedTitle: sub.feed.title
        }))
      )

      if (allArticles.length === 0) continue

      // Generate digest summary
      const digestContent = allArticles.map(article => 
        `**${article.title}** (${article.feedTitle})\n${article.description}\n`
      ).join('\n')

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Create a daily digest email from these articles. Make it engaging and highlight the most important stories:\n\n${digestContent}`
        }]
      })

      const digestSummary = message.content[0]?.type === 'text' ? message.content[0].text : 'Digest unavailable'

      // Send email
      await postmark.sendEmail({
        From: 'digest@briefly.ai',
        To: user.email,
        Subject: `Your Daily Briefly Digest - ${new Date().toLocaleDateString()}`,
        HtmlBody: `
          <h1>Your Daily Digest</h1>
          <div style="font-family: sans-serif; line-height: 1.6;">
            ${digestSummary.replace(/\n/g, '<br>')}
          </div>
          <hr>
          <p style="color: #666; font-size: 12px;">Delivered by <a href="https://briefly-mvp.vercel.app">Briefly</a></p>
        `,
        TextBody: digestSummary
      })

      results.push({
        userId: user.id,
        email: user.email,
        articlesCount: allArticles.length,
        digestSent: true
      })
    }

    return NextResponse.json({ 
      message: `Sent digests to ${results.length} users`,
      results 
    })
  } catch (error) {
    console.error('Digest generation error:', error)
    return NextResponse.json({ error: 'Failed to generate digest' }, { status: 500 })
  }
}
