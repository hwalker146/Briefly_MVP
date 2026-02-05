import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleId } = await request.json()
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const { prisma } = await import('@/lib/prisma')
    const { transcribeWithSpeakers } = await import('@/lib/whisper')

    // Get article with audio URL
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        feed: {
          include: {
            subscriptions: {
              where: { user: { email: session.user.email } }
            }
          }
        },
        transcript: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Verify user has access to this feed
    if (article.feed.subscriptions.length === 0) {
      return NextResponse.json({ error: 'Not subscribed to this feed' }, { status: 403 })
    }

    if (!article.audioUrl) {
      return NextResponse.json({ error: 'Article has no audio to transcribe' }, { status: 400 })
    }

    // Check if transcript already exists
    if (article.transcript && article.transcript.status === 'READY') {
      return NextResponse.json({
        transcript: article.transcript,
        message: 'Transcript already exists'
      })
    }

    // Create or update transcript record with PROCESSING status
    const transcript = await prisma.transcript.upsert({
      where: { articleId },
      update: { status: 'PROCESSING' },
      create: {
        articleId,
        fullText: '',
        status: 'PROCESSING'
      }
    })

    try {
      // Perform transcription
      const result = await transcribeWithSpeakers(article.audioUrl)

      // Update transcript with results
      const updatedTranscript = await prisma.transcript.update({
        where: { id: transcript.id },
        data: {
          fullText: result.text,
          speakerCount: result.speakerCount,
          wordCount: result.text.split(/\s+/).length,
          duration: Math.round(result.duration),
          language: result.language,
          status: 'READY'
        }
      })

      // Create segments
      if (result.segments.length > 0) {
        await prisma.transcriptSegment.createMany({
          data: result.segments.map((seg, index) => ({
            transcriptId: transcript.id,
            segmentIndex: index,
            text: seg.text,
            startTime: seg.start,
            endTime: seg.end,
            speaker: null // Whisper doesn't provide speaker info
          }))
        })
      }

      return NextResponse.json({
        transcript: updatedTranscript,
        segmentsCreated: result.segments.length,
        message: 'Transcription completed successfully'
      })

    } catch (transcriptionError) {
      // Update transcript with error status
      await prisma.transcript.update({
        where: { id: transcript.id },
        data: { status: 'ERROR' }
      })
      throw transcriptionError
    }

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({
      error: 'Transcription failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
