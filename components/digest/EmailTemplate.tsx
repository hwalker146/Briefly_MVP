'use client'

interface Article {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: string
  source: {
    name: string
    favicon: string
  }
  readTime: number
}

interface DigestData {
  date: string
  articles: Article[]
  totalArticles: number
  readTime: number
}

interface EmailTemplateProps {
  digestData: DigestData
}

export function EmailTemplate({ digestData }: EmailTemplateProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Email Container */}
        <div 
          className="bg-white shadow-sm"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333333'
          }}
        >
          {/* Email Header */}
          <div 
            style={{
              backgroundColor: '#4f46e5',
              padding: '32px 24px',
              textAlign: 'center' as const
            }}
          >
            <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              Briefly
            </div>
            <div style={{ color: '#c7d2fe', fontSize: '14px' }}>
              Your Daily News Digest
            </div>
          </div>

          {/* Email Body */}
          <div style={{ padding: '32px 24px' }}>
            {/* Greeting */}
            <div style={{ marginBottom: '32px', textAlign: 'center' as const }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                margin: '0 0 12px 0' 
              }}>
                Your News Summary
              </h1>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px',
                margin: '0'
              }}>
                {formatDate(digestData.date)} • {digestData.totalArticles} articles • {digestData.readTime} min read
              </p>
            </div>

            {/* Summary Box */}
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center' as const,
              marginBottom: '32px'
            }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {digestData.totalArticles}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280' 
              }}>
                articles summarized from your subscriptions
              </div>
            </div>

            {/* Articles */}
            <div>
              {digestData.articles.map((article, index) => (
                <div 
                  key={article.id}
                  style={{
                    borderBottom: index < digestData.articles.length - 1 ? '1px solid #e5e7eb' : 'none',
                    paddingBottom: '32px',
                    marginBottom: index < digestData.articles.length - 1 ? '32px' : '0'
                  }}
                >
                  {/* Article Header */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <div style={{
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '12px'
                    }}>
                      {index + 1}
                    </div>
                    <span>{article.source.name}</span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>{formatTime(article.publishedAt)}</span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>{article.readTime} min read</span>
                  </div>

                  {/* Article Title */}
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 16px 0',
                    lineHeight: '1.4'
                  }}>
                    {article.title}
                  </h2>

                  {/* Article Summary */}
                  <div style={{
                    color: '#374151',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    marginBottom: '16px'
                  }}>
                    {article.summary}
                  </div>

                  {/* Read More Link */}
                  <div>
                    <a 
                      href={article.url}
                      style={{
                        color: '#4f46e5',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Read full article →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Footer */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            padding: '24px',
            textAlign: 'center' as const
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              This digest was generated by AI based on your feed subscriptions.
            </div>

            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginBottom: '16px'
            }}>
              <a 
                href="#" 
                style={{ 
                  color: '#9ca3af', 
                  textDecoration: 'none',
                  marginRight: '16px'
                }}
              >
                Manage Preferences
              </a>
              <a 
                href="#" 
                style={{ 
                  color: '#9ca3af', 
                  textDecoration: 'none',
                  marginRight: '16px'
                }}
              >
                View All Feeds
              </a>
              <a 
                href="#" 
                style={{ 
                  color: '#9ca3af', 
                  textDecoration: 'none'
                }}
              >
                Unsubscribe
              </a>
            </div>

            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              © 2025 Briefly. All rights reserved.
            </div>
          </div>
        </div>

        {/* Email Client Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#92400e'
        }}>
          <strong>Note:</strong> This is a preview of how your email will appear. 
          Actual appearance may vary slightly depending on the email client.
        </div>
      </div>
    </div>
  )
}