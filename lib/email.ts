import nodemailer from 'nodemailer'

// Create transporter using Gmail SMTP
export const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'aipodcastdigest@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'mpzemfgtmzefwhxl'
    }
  })
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const transporter = createEmailTransporter()
  
  const mailOptions = {
    from: from || '"Briefly AI" <aipodcastdigest@gmail.com>',
    to,
    subject,
    html
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Generate digest email HTML
export function generateDigestHTML(data: {
  articles: Array<{
    id: string
    title: string
    url: string
    publishedAt: string
    summary?: { content: string }
    feed: { title: string }
  }>
  userEmail: string
  date: string
}) {
  const { articles, userEmail, date } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Digest - ${date}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 8px;
        }
        .date {
          color: #6b7280;
          font-size: 16px;
        }
        .article {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          border-left: 4px solid #4f46e5;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .article-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
          text-decoration: none;
        }
        .article-title:hover {
          color: #4f46e5;
        }
        .article-source {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .article-summary {
          color: #374151;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .read-more {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 1px solid #e5e7eb;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
        .unsubscribe {
          color: #9ca3af;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📧 Briefly</div>
        <div class="date">Your Daily Digest • ${date}</div>
      </div>
      
      ${articles.length === 0 ? `
        <div class="article">
          <h3>No new articles today</h3>
          <p>Check back tomorrow for fresh content from your RSS feeds!</p>
        </div>
      ` : articles.map(article => `
        <div class="article">
          <a href="${article.url}" class="article-title" target="_blank">
            ${article.title}
          </a>
          <div class="article-source">
            ${article.feed.title} • ${new Date(article.publishedAt).toLocaleDateString()}
          </div>
          ${article.summary ? `
            <div class="article-summary">
              ${article.summary.content}
            </div>
          ` : ''}
          <a href="${article.url}" class="read-more" target="_blank">Read full article →</a>
        </div>
      `).join('')}
      
      <div class="footer">
        <p>You're receiving this because you subscribed to Briefly AI digest.</p>
        <p>
          <a href="#" class="unsubscribe">Manage preferences</a> • 
          <a href="#" class="unsubscribe">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `
}

// Legacy interface for backward compatibility
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
  articles: DigestArticle[]
): Promise<void> {
  const digestHTML = generateDigestHTML({
    articles: articles.map(article => ({
      id: article.id,
      title: article.title,
      url: article.url,
      publishedAt: article.publishedAt.toISOString(),
      summary: { content: article.summary },
      feed: { title: article.feedTitle }
    })),
    userEmail,
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  })

  await sendEmail({
    to: userEmail,
    subject: `Your Briefly Digest - ${new Date().toLocaleDateString()}`,
    html: digestHTML
  })
}