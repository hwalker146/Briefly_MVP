import { prisma } from './prisma'

export interface ScheduledDigest {
  userId: string
  userEmail: string
  userName: string | null
  timezone: string
  frequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY'
  lastSentAt: Date | null
  nextSendAt: Date | null
}

/**
 * Calculate the next send time based on frequency and user's preferred time
 */
export function calculateNextSendTime(
  sendTime: Date,
  timezone: string,
  frequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY',
  lastSentAt: Date | null
): Date {
  const now = new Date()

  // For realtime, send immediately
  if (frequency === 'REALTIME') {
    return now
  }

  // Extract hours and minutes from sendTime (stored in UTC)
  const preferredHours = sendTime.getUTCHours()
  const preferredMinutes = sendTime.getUTCMinutes()

  // Start from today at the preferred time
  const nextSend = new Date(now)
  nextSend.setUTCHours(preferredHours, preferredMinutes, 0, 0)

  // If that time has passed today, move to tomorrow
  if (nextSend <= now) {
    nextSend.setDate(nextSend.getDate() + 1)
  }

  // Adjust based on frequency
  if (frequency === 'WEEKLY') {
    // Send on the same day of week as the original sendTime
    const targetDay = sendTime.getUTCDay()
    while (nextSend.getUTCDay() !== targetDay || nextSend <= now) {
      nextSend.setDate(nextSend.getDate() + 1)
    }
  } else if (frequency === 'BIWEEKLY') {
    // Send every 3-4 days (twice a week)
    const targetDays = [1, 4] // Monday and Thursday
    while (!targetDays.includes(nextSend.getUTCDay()) || nextSend <= now) {
      nextSend.setDate(nextSend.getDate() + 1)
    }
  }

  return nextSend
}

/**
 * Get all users who are due for a digest
 */
export async function getDueDigests(): Promise<ScheduledDigest[]> {
  const now = new Date()

  const preferences = await prisma.emailPreference.findMany({
    where: {
      isActive: true,
      nextSendAt: { lte: now },
    },
    include: {
      user: {
        select: { id: true, email: true, name: true }
      }
    }
  })

  return preferences.map(pref => ({
    userId: pref.user.id,
    userEmail: pref.user.email,
    userName: pref.user.name,
    timezone: pref.timezone,
    frequency: pref.frequency,
    lastSentAt: pref.lastSentAt,
    nextSendAt: pref.nextSendAt,
  }))
}

/**
 * Update the email preference after sending a digest
 */
export async function markDigestSent(userId: string): Promise<void> {
  const now = new Date()

  const pref = await prisma.emailPreference.findUnique({
    where: { userId }
  })

  if (!pref) return

  const nextSendAt = calculateNextSendTime(
    pref.sendTime,
    pref.timezone,
    pref.frequency,
    now
  )

  await prisma.emailPreference.update({
    where: { userId },
    data: {
      lastSentAt: now,
      nextSendAt,
    }
  })
}

/**
 * Initialize or update the next send time for a user
 */
export async function initializeSchedule(userId: string): Promise<Date> {
  const pref = await prisma.emailPreference.findUnique({
    where: { userId }
  })

  if (!pref) {
    throw new Error('Email preference not found')
  }

  const nextSendAt = calculateNextSendTime(
    pref.sendTime,
    pref.timezone,
    pref.frequency,
    pref.lastSentAt
  )

  await prisma.emailPreference.update({
    where: { userId },
    data: { nextSendAt }
  })

  return nextSendAt
}

/**
 * Get articles for a user's digest based on their subscriptions and last sent time
 */
export async function getDigestArticles(userId: string, since: Date | null) {
  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000) // Default to last 24 hours

  const subscriptions = await prisma.subscription.findMany({
    where: { userId, isActive: true },
    include: {
      feed: {
        include: {
          articles: {
            where: {
              publishedAt: { gte: sinceDate }
            },
            orderBy: { publishedAt: 'desc' },
            take: 10 // Limit per feed
          }
        }
      },
      category: true,
    }
  })

  // Flatten and sort articles
  const articles = subscriptions.flatMap(sub =>
    sub.feed.articles.map(article => ({
      ...article,
      feedTitle: sub.feed.title,
      feedUrl: sub.feed.siteUrl,
      category: sub.category?.name,
    }))
  ).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  return articles.slice(0, 20) // Limit total articles in digest
}
