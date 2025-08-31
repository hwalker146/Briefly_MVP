import { Queue, Worker, Job } from 'bullmq'
import { prisma } from './prisma'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import * as xml2js from 'xml2js'

const redisConnection = {
  connection: {
    host: process.env.REDIS_URL?.includes('://') 
      ? new URL(process.env.REDIS_URL).hostname 
      : 'localhost',
    port: process.env.REDIS_URL?.includes('://') 
      ? parseInt(new URL(process.env.REDIS_URL).port) || 6379 
      : 6379,
  },
}

export const feedPollingQueue = new Queue('feed-polling', redisConnection)
export const emailQueue = new Queue('email-digest', redisConnection)

export interface FeedPollingJobData {
  feedId: string
}

export interface EmailJobData {
  userId: string
  articles: {
    id: string
    title: string
    summary: string
    url: string
    publishedAt: string
    feedTitle: string
  }[]
}

async function processFeedPolling(job: Job<FeedPollingJobData>) {
  const { feedId } = job.data

  try {
    const feed = await prisma.feedSource.findUnique({
      where: { id: feedId },
    })

    if (!feed) {
      throw new Error(`Feed ${feedId} not found`)
    }

    const response = await fetch(feed.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`)
    }

    const xmlText = await response.text()
    const parsed = await xml2js.parseStringPromise(xmlText)
    
    const channel = parsed.rss?.channel?.[0] || parsed.feed
    const items = channel.item || channel.entry || []

    for (const item of items) {
      const guid = item.guid?.[0]?._ || item.guid?.[0] || item.id?.[0] || item.link?.[0]
      const title = item.title?.[0]
      const description = item.description?.[0] || item.summary?.[0]
      const url = item.link?.[0]
      const publishedAt = new Date(item.pubDate?.[0] || item.published?.[0] || Date.now())

      if (!guid || !title || !url) continue

      const existingArticle = await prisma.article.findUnique({
        where: {
          feedId_guid: {
            feedId: feed.id,
            guid,
          },
        },
      })

      if (existingArticle) continue

      let fullText: string | null = null
      try {
        const articleResponse = await fetch(url)
        if (articleResponse.ok) {
          const html = await articleResponse.text()
          const dom = new JSDOM(html)
          const reader = new Readability(dom.window.document)
          const article = reader.parse()
          fullText = article?.textContent || null
        }
      } catch (error) {
        console.warn(`Failed to extract full text for ${url}:`, error)
      }

      await prisma.article.create({
        data: {
          feedId: feed.id,
          title,
          description,
          fullText,
          url,
          guid,
          publishedAt,
        },
      })
    }

    await prisma.feedSource.update({
      where: { id: feed.id },
      data: {
        lastFetched: new Date(),
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
      },
    })

    console.log(`Successfully processed feed ${feed.title}`)
  } catch (error) {
    console.error(`Error processing feed ${feedId}:`, error)
    throw error
  }
}

async function processEmailDigest(job: Job<EmailJobData>) {
  const { userId, articles } = job.data

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        emailPreference: true,
      },
    })

    if (!user || !user.emailPreference?.isActive) {
      console.log(`User ${userId} not found or email disabled`)
      return
    }

    const { sendDigestEmail } = await import('./email')
    const digestArticles = articles.map(article => ({
      ...article,
      publishedAt: new Date(article.publishedAt)
    }))
    await sendDigestEmail(user.email, digestArticles)
    
    console.log(`Successfully sent email digest to ${user.email}`)
  } catch (error) {
    console.error(`Error sending email digest to user ${userId}:`, error)
    throw error
  }
}

if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
  new Worker('feed-polling', processFeedPolling, redisConnection)
  new Worker('email-digest', processEmailDigest, redisConnection)
}

export async function scheduleFeedPolling() {
  const feeds = await prisma.feedSource.findMany({
    where: {
      subscriptions: {
        some: {
          isActive: true,
        },
      },
    },
  })

  for (const feed of feeds) {
    await feedPollingQueue.add(
      `poll-${feed.id}`,
      { feedId: feed.id },
      {
        repeat: { pattern: '0 */30 * * * *' }, // Every 30 minutes
        jobId: `feed-${feed.id}`,
      }
    )
  }
}