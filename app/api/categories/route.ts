import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        categories: {
          include: {
            subscriptions: {
              include: { feed: true }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ categories: [] })
    }

    const categories = user.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      feedCount: cat.subscriptions.length,
      feeds: cat.subscriptions.map(sub => ({
        id: sub.feed.id,
        title: sub.feed.title,
        url: sub.feed.url,
      }))
    }))

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, color, icon } = await request.json()
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: { userId_name: { userId: user.id, name: name.trim() } }
    })

    if (existing) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: name.trim(),
        color: color || '#6366f1',
        icon: icon || null,
      }
    })

    return NextResponse.json({ category })

  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
