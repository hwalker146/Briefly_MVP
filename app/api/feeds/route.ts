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

    // Create feed source and subscription
    const feedSource = await prisma.feedSource.create({
      data: {
        url,
        title: feed.title || 'Unknown Feed',
        description: feed.description || '',
        siteUrl: feed.link
      }
    })

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        feedId: feedSource.id
      }
    })

    return NextResponse.json({ feed: feedSource })
  } catch (error) {
    console.error('RSS parsing error:', error)
    return NextResponse.json({ error: 'Invalid RSS feed URL' }, { status: 400 })
  }
}
