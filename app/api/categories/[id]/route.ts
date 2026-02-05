import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const prisma = await getPrisma()

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        subscriptions: {
          include: {
            feed: {
              include: {
                articles: {
                  take: 5,
                  orderBy: { publishedAt: 'desc' }
                }
              }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ category })

  } catch (error) {
    console.error('Category fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, color, icon } = await request.json()

    const prisma = await getPrisma()

    const category = await prisma.category.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(icon !== undefined && { icon }),
      }
    })

    return NextResponse.json({ category: updated })

  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const prisma = await getPrisma()

    const category = await prisma.category.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete category (subscriptions will have categoryId set to null via SetNull)
    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
