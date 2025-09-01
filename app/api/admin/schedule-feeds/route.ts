import { NextResponse } from 'next/server'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

const getParser = async () => {
  const Parser = (await import('rss-parser')).default
  return new Parser()
}

export async function POST() {
  try {
    const prisma = await getPrisma()
    const parser = await getParser()
    
    // Get all feed sources that need updating
    const feeds = await prisma.feedSource.findMany({
      where: {
        OR: [
          { lastFetched: null },
          { lastFetched: { lt: new Date(Date.now() - 60 * 60 * 1000) } } // Last hour
        ]
      }
    })

    const results = []
    
    for (const feedSource of feeds) {
      try {
        const feed = await parser.parseURL(feedSource.url)
        
        // Update feed metadata
        await prisma.feedSource.update({
          where: { id: feedSource.id },
          data: {
            title: feed.title || feedSource.title,
            description: feed.description || feedSource.description,
            siteUrl: feed.link || feedSource.siteUrl,
            lastFetched: new Date()
          }
        })

        // Add new articles
        const articles = feed.items?.slice(0, 20) || []
        let newArticles = 0
        
        for (const item of articles) {
          if (item.guid && item.title) {
            const result = await prisma.article.upsert({
              where: {
                feedId_guid: {
                  feedId: feedSource.id,
                  guid: item.guid
                }
              },
              update: {},
              create: {
                feedId: feedSource.id,
                title: item.title,
                description: item.contentSnippet || item.content || '',
                url: item.link || '',
                guid: item.guid,
                publishedAt: new Date(item.pubDate || item.isoDate || Date.now())
              }
            })
            
            // Count if this was a new article (created)
            if (result.createdAt.getTime() === result.publishedAt.getTime()) {
              newArticles++
            }
          }
        }

        results.push({
          feedId: feedSource.id,
          title: feedSource.title,
          newArticles,
          totalProcessed: articles.length
        })
      } catch (error) {
        console.error(`Error processing feed ${feedSource.url}:`, error)
        results.push({
          feedId: feedSource.id,
          title: feedSource.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ 
      message: `Processed ${feeds.length} feeds`,
      results 
    })
  } catch (error) {
    console.error('Feed scheduling error:', error)
    return NextResponse.json({ error: 'Failed to schedule feeds' }, { status: 500 })
  }
}
