import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface SummarizeOptions {
  prompt?: string
  maxTokens?: number
}

export async function summarizeArticle(
  title: string,
  content: string,
  options: SummarizeOptions = {}
): Promise<string> {
  const defaultPrompt = `Please provide a concise summary of this article. Focus on the key points, main arguments, and important details. Keep it informative but brief.`
  
  const prompt = options.prompt || defaultPrompt
  const maxTokens = options.maxTokens || 300

  const systemMessage = `You are an expert at summarizing news articles and blog posts. ${prompt}`
  
  const userMessage = `Article Title: ${title}

Article Content:
${content}

Please provide a summary following the instructions given.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const summary = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Failed to generate summary'

    return summary
  } catch (error) {
    console.error('Error generating summary:', error)
    throw new Error('Failed to generate article summary')
  }
}

export interface TranscriptCitation {
  segmentIndex: number
  text: string
  startTime: number
  endTime: number
  speaker?: string
}

export interface TranscriptAnswer {
  answer: string
  citations: TranscriptCitation[]
}

export async function askTranscriptQuestion(
  question: string,
  segments: Array<{ segmentIndex: number; speaker?: string; text: string; startTime: number; endTime: number }>,
  episodeTitle: string
): Promise<TranscriptAnswer> {
  const segmentsText = segments
    .map(s => `[Segment ${s.segmentIndex}] [${formatTimestamp(s.startTime)} - ${formatTimestamp(s.endTime)}]${s.speaker ? ` ${s.speaker}:` : ''} ${s.text}`)
    .join('\n')

  const systemMessage = `You are an expert podcast analyst. You answer questions about podcast transcripts by citing specific segments from the transcript.

IMPORTANT RULES:
1. Always ground your answer in specific quotes from the transcript
2. For each claim or point you make, cite the exact segment(s) that support it
3. Use the format [Segment X] to reference segments
4. If the transcript doesn't contain information to answer the question, say so clearly
5. Be precise and concise in your answers

Respond in this exact JSON format:
{
  "answer": "Your detailed answer here, referencing [Segment X] inline where relevant.",
  "citations": [
    {
      "segmentIndex": 5,
      "text": "The exact quote from the segment",
      "startTime": 120.5,
      "endTime": 135.2,
      "speaker": "Host"
    }
  ]
}

Only include the JSON in your response, no other text.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: `Podcast Episode: "${episodeTitle}"\n\nTranscript:\n${segmentsText}\n\nQuestion: ${question}`,
        },
      ],
    })

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    const parsed = JSON.parse(responseText)
    return {
      answer: parsed.answer || 'Could not generate an answer.',
      citations: parsed.citations || [],
    }
  } catch (error) {
    console.error('Error answering transcript question:', error)
    throw new Error('Failed to answer transcript question')
  }
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export async function summarizeMultipleArticles(
  articles: Array<{ title: string; content: string }>,
  prompt?: string
): Promise<string> {
  const defaultPrompt = `You are creating a digest of multiple articles. For each article, provide a brief summary, then conclude with an overall digest summary highlighting the main themes and most important stories.`
  
  const systemMessage = prompt || defaultPrompt
  
  const articlesText = articles
    .map((article, index) => `Article ${index + 1}: ${article.title}\n${article.content}`)
    .join('\n\n---\n\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: articlesText,
        },
      ],
    })

    const summary = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Failed to generate digest summary'

    return summary
  } catch (error) {
    console.error('Error generating digest summary:', error)
    throw new Error('Failed to generate digest summary')
  }
}