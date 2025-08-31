import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as xml2js from 'xml2js'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        feed: true,
        prompt: true,
      },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching feeds:', error)
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch and validate RSS feed
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch RSS feed' }, { status: 400 })
    }

    const xmlText = await response.text()
    const parsed = await xml2js.parseStringPromise(xmlText)
    
    const channel = parsed.rss?.channel?.[0] || parsed.feed
    if (!channel) {
      return NextResponse.json({ error: 'Invalid RSS feed format' }, { status: 400 })
    }

    // Create or find existing feed source
    let feedSource = await prisma.feedSource.findUnique({
      where: { url },
    })

    if (!feedSource) {
      feedSource = await prisma.feedSource.create({
        data: {
          url,
          title: channel.title?.[0] || 'Unknown Feed',
          description: channel.description?.[0] || null,
          siteUrl: channel.link?.[0] || null,
        },
      })
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        feedId: feedSource.id,
      },
      include: {
        feed: true,
      },
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error adding feed:', error)
    return NextResponse.json({ error: 'Failed to add feed' }, { status: 500 })
  }
}