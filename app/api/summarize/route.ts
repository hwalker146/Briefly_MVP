import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleIds, promptId } = await request.json()
    
    const prisma = await getPrisma()
    const anthropic = await getAnthropic()
    
    // Get user and articles
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds }
      },
      include: {
        feed: true
      }
    })

    // Get prompt
    const prompt = promptId ? await prisma.prompt.findUnique({
      where: { id: promptId }
    }) : null

    const promptContent = prompt?.content || `
Summarize these articles in a clear, concise way. Focus on key insights and important developments.
For each article, provide:
- Main point or finding
- Why it matters
- Key details

Keep summaries brief but informative.
`

    // Create article summaries
    const summaries = []
    for (const article of articles) {
      const articleText = `
Title: ${article.title}
Source: ${article.feed.title}
Content: ${article.description || 'No content available'}
URL: ${article.url}
Published: ${article.publishedAt}
`

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `${promptContent}\n\nArticle to summarize:\n${articleText}`
        }]
      })

      const summaryContent = message.content[0]?.type === 'text' ? message.content[0].text : 'Summary unavailable'

      // Save summary to database
      const summary = await prisma.summary.upsert({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId: article.id
          }
        },
        update: {
          content: summaryContent,
          promptId: promptId || null
        },
        create: {
          userId: user.id,
          articleId: article.id,
          content: summaryContent,
          promptId: promptId || null
        }
      })

      summaries.push({
        ...summary,
        article: {
          title: article.title,
          url: article.url,
          feed: article.feed.title
        }
      })
    }

    return NextResponse.json({ 
      summaries,
      message: `Generated ${summaries.length} summaries`
    })
  } catch (error) {
    console.error('Summarization error:', error)
    return NextResponse.json({ error: 'Failed to generate summaries' }, { status: 500 })
  }
}
