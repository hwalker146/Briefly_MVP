import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Dynamic imports to avoid build-time database connections
const getParser = async () => {
  const Parser = (await import('rss-parser')).default
  return new Parser()
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
        await prisma.article.upsert({
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
      }
    }

    return NextResponse.json({ 
      feed: feedSource, 
      articlesAdded: articles.length,
      message: 'Feed added successfully'
    })
  } catch (error) {
    console.error('RSS parsing error:', error)
    return NextResponse.json({ error: 'Invalid RSS feed URL' }, { status: 400 })
  }
}
