import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const content = formData.get('content') as string | null

    let opmlContent: string
    if (file) {
      opmlContent = await file.text()
    } else if (content) {
      opmlContent = content
    } else {
      return NextResponse.json({ error: 'No OPML file or content provided' }, { status: 400 })
    }

    const { parseOPML } = await import('@/lib/opml')
    const { prisma } = await import('@/lib/prisma')

    // Parse OPML
    const opmlData = await parseOPML(opmlContent)

    // Get or create user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
      }
    })

    // Track import results
    const results = {
      total: opmlData.feeds.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      categories: new Set<string>(),
      errors: [] as string[],
    }

    // Create categories first
    const categoryMap = new Map<string, string>() // name -> id
    const uniqueCategories = Array.from(new Set(opmlData.feeds.map(f => f.category).filter((c): c is string => Boolean(c))))

    for (const categoryName of uniqueCategories) {
      if (categoryName) {
        results.categories.add(categoryName)
        const category = await prisma.category.upsert({
          where: { userId_name: { userId: user.id, name: categoryName } },
          update: {},
          create: { userId: user.id, name: categoryName }
        })
        categoryMap.set(categoryName, category.id)
      }
    }

    // Import feeds
    for (const feed of opmlData.feeds) {
      try {
        // Create or get feed source
        const feedSource = await prisma.feedSource.upsert({
          where: { url: feed.xmlUrl },
          update: {},
          create: {
            url: feed.xmlUrl,
            title: feed.title,
            description: feed.description || null,
            siteUrl: feed.htmlUrl || null,
          }
        })

        // Check if already subscribed
        const existingSub = await prisma.subscription.findUnique({
          where: { userId_feedId: { userId: user.id, feedId: feedSource.id } }
        })

        if (existingSub) {
          // Update category if provided
          if (feed.category) {
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: { categoryId: categoryMap.get(feed.category) }
            })
          }
          results.skipped++
        } else {
          // Create subscription
          await prisma.subscription.create({
            data: {
              userId: user.id,
              feedId: feedSource.id,
              categoryId: feed.category ? categoryMap.get(feed.category) : null,
            }
          })
          results.imported++
        }
      } catch (feedError) {
        results.failed++
        results.errors.push(`Failed to import "${feed.title}": ${feedError instanceof Error ? feedError.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        total: results.total,
        imported: results.imported,
        skipped: results.skipped,
        failed: results.failed,
        categoriesCreated: results.categories.size,
      },
      errors: results.errors.length > 0 ? results.errors.slice(0, 10) : undefined,
      message: `Imported ${results.imported} feeds, skipped ${results.skipped} existing, ${results.failed} failed`
    })

  } catch (error) {
    console.error('OPML import error:', error)
    return NextResponse.json({
      error: 'Failed to parse OPML file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}
