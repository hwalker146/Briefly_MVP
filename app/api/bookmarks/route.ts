import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        bookmarks: {
          include: {
            article: {
              include: {
                feed: { select: { title: true, siteUrl: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ bookmarks: [] })
    }

    const bookmarks = user.bookmarks.map(bm => ({
      id: bm.id,
      notes: bm.notes,
      createdAt: bm.createdAt,
      article: {
        id: bm.article.id,
        title: bm.article.title,
        description: bm.article.description,
        url: bm.article.url,
        publishedAt: bm.article.publishedAt,
        feed: bm.article.feed,
      }
    }))

    return NextResponse.json({ bookmarks })

  } catch (error) {
    console.error('Bookmarks fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleId, notes } = await request.json()
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Upsert bookmark
    const bookmark = await prisma.bookmark.upsert({
      where: { userId_articleId: { userId: user.id, articleId } },
      update: { notes: notes || null },
      create: {
        userId: user.id,
        articleId,
        notes: notes || null,
      },
      include: {
        article: {
          include: { feed: { select: { title: true } } }
        }
      }
    })

    return NextResponse.json({ bookmark })

  } catch (error) {
    console.error('Bookmark create error:', error)
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleId } = await request.json()
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.bookmark.deleteMany({
      where: { userId: user.id, articleId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Bookmark delete error:', error)
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
  }
}
