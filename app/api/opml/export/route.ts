import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { generateOPML } = await import('@/lib/opml')
    const { prisma } = await import('@/lib/prisma')

    // Get user's subscriptions with feed and category data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { isActive: true },
          include: {
            feed: true,
            category: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Format feeds for OPML export
    const feeds = user.subscriptions.map(sub => ({
      title: sub.feed.title || 'Untitled Feed',
      url: sub.feed.url,
      siteUrl: sub.feed.siteUrl || undefined,
      category: sub.category?.name,
    }))

    // Generate OPML
    const opmlContent = generateOPML(feeds, `Briefly Export - ${user.name || user.email}`)

    // Return as downloadable file
    return new NextResponse(opmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="briefly-feeds-${new Date().toISOString().split('T')[0]}.opml"`,
      },
    })

  } catch (error) {
    console.error('OPML export error:', error)
    return NextResponse.json({
      error: 'Failed to export feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
