import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { askTranscriptQuestion } from '@/lib/claude'

// POST /api/transcripts/[id]/ask - Ask a question about a transcript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { question } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    if (question.length > 1000) {
      return NextResponse.json({ error: 'Question is too long (max 1000 characters)' }, { status: 400 })
    }

    // Get transcript with segments
    const transcript = await prisma.transcript.findUnique({
      where: { id: params.id },
      include: {
        article: { select: { title: true } },
        segments: {
          orderBy: { segmentIndex: 'asc' }
        }
      }
    })

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    if (transcript.status !== 'READY') {
      return NextResponse.json({ error: 'Transcript is not ready yet' }, { status: 400 })
    }

    // Build segments for the AI
    const segments = transcript.segments.map((s: any) => ({
      segmentIndex: s.segmentIndex,
      speaker: s.speaker,
      text: s.text,
      startTime: s.startTime,
      endTime: s.endTime
    }))

    // Ask Claude the question with transcript context
    const result = await askTranscriptQuestion(
      question.trim(),
      segments,
      transcript.article.title
    )

    // Save the Q&A to the database
    const chat = await prisma.transcriptChat.create({
      data: {
        transcriptId: params.id,
        userId: user.id,
        question: question.trim(),
        answer: result.answer,
        citations: JSON.stringify(result.citations)
      }
    })

    return NextResponse.json({
      id: chat.id,
      question: chat.question,
      answer: result.answer,
      citations: result.citations,
      createdAt: chat.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Error answering transcript question:', error)
    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 })
  }
}
