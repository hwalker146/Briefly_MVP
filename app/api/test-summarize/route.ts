import { NextResponse } from 'next/server'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

const getAnthropic = async () => {
  const { Anthropic } = await import('@anthropic-ai/sdk')
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
}

export async function POST() {
  try {
    const prisma = await getPrisma()
    const anthropic = await getAnthropic()
    
    // Get recent articles without summaries
    const articles = await prisma.article.findMany({
      where: {
        summaries: {
          none: {}
        }
      },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      include: {
        feed: true
      }
    })

    if (articles.length === 0) {
      return NextResponse.json({ message: 'No articles to summarize' })
    }

    const results = []
    
    for (const article of articles) {
      try {
        // Create a basic summary prompt
        const promptContent = "Please provide a concise 2-3 sentence summary of this article, focusing on the key points and main takeaways."
        
        const message = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `${promptContent}\n\nTitle: ${article.title}\n\nContent: ${article.description}`
          }]
        })

        const summaryContent = message.content[0]?.type === 'text' ? message.content[0].text : 'Summary unavailable'

        // Find or create a user for testing (using first user or create test user)
        const user = await prisma.user.findFirst() || await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User'
          }
        })

        // Save summary
        await prisma.summary.create({
          data: {
            userId: user.id,
            articleId: article.id,
            content: summaryContent
          }
        })

        results.push({
          articleId: article.id,
          title: article.title,
          summary: summaryContent
        })
      } catch (error) {
        console.error(`Error summarizing article ${article.id}:`, error)
        results.push({
          articleId: article.id,
          title: article.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ 
      message: 'Summarization test completed',
      results,
      totalProcessed: articles.length
    })
  } catch (error) {
    console.error('Test summarization error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}