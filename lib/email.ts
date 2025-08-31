import * as postmark from 'postmark'
import { summarizeMultipleArticles } from './claude'

const client = new postmark.ServerClient(process.env.POSTMARK_TOKEN!)

export interface DigestArticle {
  id: string
  title: string
  url: string
  summary: string
  publishedAt: Date
  feedTitle: string
}

export async function sendDigestEmail(
  userEmail: string,
  articles: DigestArticle[],
  customPrompt?: string
): Promise<void> {
  if (articles.length === 0) {
    console.log(`No articles to send for ${userEmail}`)
    return
  }

  try {
    // Generate overall digest summary
    const articlesForSummary = articles.map(article => ({
      title: article.title,
      content: article.summary,
    }))

    const digestSummary = await summarizeMultipleArticles(
      articlesForSummary,
      customPrompt
    )

    // Create HTML email content
    const htmlContent = createEmailHTML(articles, digestSummary)
    const textContent = createEmailText(articles, digestSummary)

    await client.sendEmail({
      From: 'digest@briefly.ai',
      To: userEmail,
      Subject: `Your Daily Briefly Digest - ${new Date().toLocaleDateString()}`,
      HtmlBody: htmlContent,
      TextBody: textContent,
    })

    console.log(`Digest email sent successfully to ${userEmail}`)
  } catch (error) {
    console.error(`Failed to send digest email to ${userEmail}:`, error)
    throw error
  }
}

function createEmailHTML(articles: DigestArticle[], digestSummary: string): string {
  const articlesHTML = articles
    .map(
      article => `
      <div style="margin-bottom: 24px; padding: 16px; border-left: 4px solid #3b82f6; background-color: #f8fafc;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b;">
          <a href="${article.url}" style="color: #1e293b; text-decoration: none;">${article.title}</a>
        </h3>
        <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
          From ${article.feedTitle} • ${article.publishedAt.toLocaleDateString()}
        </p>
        <p style="margin: 0; color: #475569; line-height: 1.6;">
          ${article.summary}
        </p>
      </div>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Briefly Digest</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1e293b; margin: 0;">Briefly</h1>
        <p style="color: #64748b; margin: 8px 0 0 0;">Your Daily AI Digest</p>
      </div>

      <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; color: #1e40af;">Today's Digest Summary</h2>
        <p style="margin: 0; color: #1e3a8a;">${digestSummary}</p>
      </div>

      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        Articles (${articles.length})
      </h2>

      ${articlesHTML}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>You're receiving this because you subscribed to Briefly digest emails.</p>
        <p>
          <a href="{{UnsubscribeURL}}" style="color: #3b82f6;">Unsubscribe</a> |
          <a href="https://briefly.ai/dashboard" style="color: #3b82f6;">Manage Settings</a>
        </p>
      </div>
    </body>
    </html>
  `
}

function createEmailText(articles: DigestArticle[], digestSummary: string): string {
  const articlesText = articles
    .map(
      article => `
${article.title}
From ${article.feedTitle} • ${article.publishedAt.toLocaleDateString()}
${article.summary}
Read more: ${article.url}

---
`
    )
    .join('')

  return `
BRIEFLY - YOUR DAILY AI DIGEST
${new Date().toLocaleDateString()}

TODAY'S DIGEST SUMMARY
${digestSummary}

ARTICLES (${articles.length})
${articlesText}

---
You're receiving this because you subscribed to Briefly digest emails.
Manage your settings: https://briefly.ai/dashboard
  `.trim()
}