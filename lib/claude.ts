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