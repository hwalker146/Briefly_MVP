import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Dynamic imports to avoid build-time database connections
const getParser = async () => {
  const Parser = (await import('rss-parser')).default
  // Configure parser with custom fields for podcast support
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
    
    // Ensure user exists in database
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
      },
      include: { 
        subscriptions: {
          include: { feed: true }
        }
      }
    })

    const feeds = user.subscriptions.map(sub => sub.feed) || []
    return NextResponse.json({ feeds })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()
    
    const parser = await getParser()
    const prisma = await getPrisma()
    
    // Validate and parse RSS feed
    const feed = await parser.parseURL(url)
    
    // Ensure user exists in database
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
      }
    })

    // Check if feed already exists
    const existingFeed = await prisma.feedSource.findUnique({
      where: { url }
    })

    const feedSource = existingFeed || await prisma.feedSource.create({
      data: {
        url,
        title: feed.title || 'Unknown Feed',
        description: feed.description || '',
        siteUrl: feed.link
      }
    })

    // Check if user is already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_feedId: {
          userId: user.id,
          feedId: feedSource.id
        }
      }
    })

    if (!existingSubscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          feedId: feedSource.id
        }
      })
    }

    // Fetch and store recent articles
    const articles = feed.items?.slice(0, 10) || []
    for (const item of articles) {
      if (item.guid && item.title) {
        // Check for podcast audio enclosure
        const enclosure = item.enclosure as { url?: string; type?: string; length?: string } | undefined
        const isAudio = enclosure?.type?.startsWith('audio/') ||
                        enclosure?.url?.match(/\.(mp3|m4a|wav|ogg|aac)(\?|$)/i)
        const audioUrl = isAudio ? enclosure?.url : undefined

        // Parse duration from iTunes duration field (can be seconds or HH:MM:SS format)
        let duration: number | undefined
        const itunesDuration = (item as { itunesDuration?: string }).itunesDuration
        if (itunesDuration) {
          if (itunesDuration.includes(':')) {
            // Parse HH:MM:SS or MM:SS format
            const parts = itunesDuration.split(':').map(Number)
            if (parts.length === 3) {
              duration = parts[0] * 3600 + parts[1] * 60 + parts[2]
            } else if (parts.length === 2) {
              duration = parts[0] * 60 + parts[1]
            }
          } else {
            // Already in seconds
            duration = parseInt(itunesDuration, 10)
          }
        }

        await prisma.article.upsert({
          where: {
            feedId_guid: {
              feedId: feedSource.id,
              guid: item.guid
            }
          },
          update: {
            // Update audio info if it wasn't set before
            ...(audioUrl && { audioUrl }),
            ...(duration && { duration })
          },
          create: {
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
      }
    }

    return NextResponse.json({ 
      feed: feedSource, 
      articlesAdded: articles.length,
      message: 'Feed added successfully'
    })
  } catch (error) {
    console.error('RSS parsing error:', error)
    return NextResponse.json({ 
      error: 'Invalid RSS feed URL',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: request.url
    }, { status: 400 })
  }
}
