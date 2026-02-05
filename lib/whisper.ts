import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TranscriptionSegment {
  text: string
  start: number
  end: number
}

export interface TranscriptionResult {
  text: string
  segments: TranscriptionSegment[]
  language: string
  duration: number
}

/**
 * Transcribe audio from a URL using OpenAI Whisper
 * Downloads the audio file and sends it to Whisper API
 */
export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  // Download audio file
  const response = await fetch(audioUrl)
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const audioBlob = new Blob([audioBuffer])

  // Determine file extension from URL or content-type
  const contentType = response.headers.get('content-type') || ''
  let extension = 'mp3'
  if (contentType.includes('mp4') || contentType.includes('m4a')) extension = 'm4a'
  else if (contentType.includes('wav')) extension = 'wav'
  else if (contentType.includes('ogg')) extension = 'ogg'
  else if (audioUrl.match(/\.(mp3|m4a|wav|ogg|webm)(\?|$)/i)) {
    const match = audioUrl.match(/\.(mp3|m4a|wav|ogg|webm)/i)
    if (match) extension = match[1].toLowerCase()
  }

  // Create File object for OpenAI API
  const file = new File([audioBlob], `audio.${extension}`, { type: contentType || `audio/${extension}` })

  // Call Whisper API with verbose JSON for timestamps
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  })

  // Extract segments with timestamps
  const segments: TranscriptionSegment[] = (transcription.segments || []).map((seg: { text: string; start: number; end: number }) => ({
    text: seg.text.trim(),
    start: seg.start,
    end: seg.end,
  }))

  return {
    text: transcription.text,
    segments,
    language: transcription.language || 'en',
    duration: transcription.duration || 0,
  }
}

/**
 * Transcribe audio with speaker diarization (using post-processing)
 * Note: Whisper doesn't natively support diarization, so this is a simplified version
 * For production, consider integrating pyannote.audio or AssemblyAI for proper diarization
 */
export async function transcribeWithSpeakers(audioUrl: string): Promise<TranscriptionResult & { speakerCount: number }> {
  const result = await transcribeAudio(audioUrl)

  // Simple heuristic for speaker detection based on sentence patterns
  // In production, use a dedicated diarization service
  let speakerCount = 1
  const speakerPatterns = [
    /^(host|interviewer|guest|speaker\s*\d*|dr\.|mr\.|mrs\.|ms\.)/i,
    /:\s*$/,
    /^\[.*?\]/,
  ]

  const hasMultipleSpeakers = result.segments.some(seg =>
    speakerPatterns.some(pattern => pattern.test(seg.text))
  )

  if (hasMultipleSpeakers) {
    speakerCount = 2 // Conservative estimate
  }

  return {
    ...result,
    speakerCount,
  }
}

/**
 * Estimate transcription cost based on audio duration
 * Whisper pricing: $0.006 per minute
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const minutes = Math.ceil(durationSeconds / 60)
  return minutes * 0.006
}
