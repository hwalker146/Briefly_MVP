import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

const getParser = async () => {
  const Parser = (await import('rss-parser')).default
  return new Parser({
    customFields: {
      item: [
        ['itunes:duration', 'itunesDuration'],
        ['itunes:author', 'itunesAuthor'],
        ['itunes:explicit', 'itunesExplicit'],
      ]
    }
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
    const parser = await getParser()

    // Get all feed sources that need updating (not fetched in last hour)
    const feeds = await prisma.feedSource.findMany({
      where: {
        OR: [
          { lastFetched: null },
          { lastFetched: { lt: new Date(Date.now() - 60 * 60 * 1000) } }
        ]
      }
    })

    const results = []

    for (const feedSource of feeds) {
      try {
        const feed = await parser.parseURL(feedSource.url)

        // Update feed metadata and reset error count
        await prisma.feedSource.update({
          where: { id: feedSource.id },
          data: {
            title: feed.title || feedSource.title,
            description: feed.description || feedSource.description,
            siteUrl: feed.link || feedSource.siteUrl,
            lastFetched: new Date(),
            errorCount: 0
          }
        })

        // Add new articles
        const articles = feed.items?.slice(0, 20) || []
        let newArticles = 0

        for (const item of articles) {
          if (item.guid && item.title) {
            // Check for podcast audio
            const enclosure = item.enclosure as { url?: string; type?: string } | undefined
            const isAudio = enclosure?.type?.startsWith('audio/') ||
                           enclosure?.url?.match(/\.(mp3|m4a|wav|ogg|aac)(\?|$)/i)
            const audioUrl = isAudio ? enclosure?.url : undefined

            // Parse duration
            let duration: number | undefined
            const itunesDuration = (item as { itunesDuration?: string }).itunesDuration
            if (itunesDuration) {
              if (itunesDuration.includes(':')) {
                const parts = itunesDuration.split(':').map(Number)
                if (parts.length === 3) {
                  duration = parts[0] * 3600 + parts[1] * 60 + parts[2]
                } else if (parts.length === 2) {
                  duration = parts[0] * 60 + parts[1]
                }
              } else {
                duration = parseInt(itunesDuration, 10)
              }
            }

            const existing = await prisma.article.findUnique({
              where: { feedId_guid: { feedId: feedSource.id, guid: item.guid } }
            })

            if (!existing) {
              await prisma.article.create({
                data: {
                  feedId: feedSource.id,
                  title: item.title,
                  description: item.contentSnippet || item.content || '',
                  url: item.link || '',
                  guid: item.guid,
                  publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
                  audioUrl,
                  duration
                }
              })
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

        // Increment error count
        await prisma.feedSource.update({
          where: { id: feedSource.id },
          data: { errorCount: { increment: 1 } }
        })

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

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return POST(request)
}
