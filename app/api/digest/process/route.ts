import { NextResponse } from 'next/server'

/**
 * Process scheduled digests
 * This endpoint should be called by a cron job (e.g., every 15 minutes)
 *
 * Security: Requires CRON_SECRET header to prevent unauthorized access
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getDueDigests, getDigestArticles, markDigestSent } = await import('@/lib/scheduler')
    const { summarizeArticle } = await import('@/lib/claude')
    const { sendDigestEmail } = await import('@/lib/email')
    const { prisma } = await import('@/lib/prisma')

    // Get users due for digest
    const dueDigests = await getDueDigests()

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const digest of dueDigests) {
      results.processed++

      try {
        // Get articles since last digest
        const articles = await getDigestArticles(digest.userId, digest.lastSentAt)

        if (articles.length === 0) {
          // No new articles, still update schedule
          await markDigestSent(digest.userId)
          results.skipped++
          continue
        }

        // Generate summaries for articles that don't have them
        const articlesWithSummaries = await Promise.all(
          articles.map(async (article) => {
            // Check for existing summary
            const existingSummary = await prisma.summary.findUnique({
              where: {
                userId_articleId: {
                  userId: digest.userId,
                  articleId: article.id,
                }
              }
            })

            if (existingSummary) {
              return { ...article, summary: existingSummary.content }
            }

            // Generate new summary
            try {
              const content = article.fullText || article.description || article.title
              const summary = await summarizeArticle(content, undefined)

              // Store summary
              await prisma.summary.create({
                data: {
                  userId: digest.userId,
                  articleId: article.id,
                  content: summary,
                }
              })

              return { ...article, summary }
            } catch {
              return { ...article, summary: article.description || 'Summary unavailable' }
            }
          })
        )

        // Send digest email
        await sendDigestEmail(
          digest.userEmail,
          digest.userName || 'Reader',
          articlesWithSummaries.map(a => ({
            title: a.title,
            summary: a.summary,
            url: a.url,
            feedTitle: a.feedTitle || 'Unknown Feed',
            publishedAt: a.publishedAt,
          }))
        )

        // Mark digest as sent and schedule next
        await markDigestSent(digest.userId)
        results.sent++

      } catch (error) {
        results.errors.push(`Failed for ${digest.userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Digest processing error:', error)
    return NextResponse.json({
      error: 'Failed to process digests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'digest-processor',
    message: 'Use POST with x-cron-secret header to process digests'
  })
}
