import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET /api/prompts - List user's prompts
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
        prompts: {
          orderBy: { createdAt: 'desc' },
          include: {
            subscriptions: {
              include: { feed: { select: { title: true } } }
            },
            _count: { select: { summaries: true } }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ prompts: [] })
    }

    const prompts = user.prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      isGlobal: prompt.isGlobal,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      feedCount: prompt.subscriptions.length,
      summaryCount: prompt._count.summaries,
      feeds: prompt.subscriptions.map((sub) => sub.feed.title).filter(Boolean),
    }))

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, isGlobal } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const prompt = await prisma.prompt.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        isGlobal: isGlobal || false,
      }
    })

    return NextResponse.json({ prompt, message: 'Prompt created successfully' })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}
