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
      include: { feeds: true }
    })

    return NextResponse.json({ feeds: user?.feeds || [] })
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

    // Create feed record
    const newFeed = await prisma.feed.create({
      data: {
        url,
        title: feed.title || 'Unknown Feed',
        description: feed.description || '',
        userId: user.id
      }
    })

    return NextResponse.json({ feed: newFeed })
  } catch (error) {
    console.error('RSS parsing error:', error)
    return NextResponse.json({ error: 'Invalid RSS feed URL' }, { status: 400 })
  }
}
