import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        subscriptions: {
          include: { feed: true }
        }
      }
    })

    const feeds = user?.subscriptions.map(sub => sub.feed) || []
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
    
    // Validate and parse RSS feed
    const feed = await parser.parseURL(url)
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
