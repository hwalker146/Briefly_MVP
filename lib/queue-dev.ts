// Development version - no Redis required
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

// Mock queue for development
export const feedPollingQueue = {
  add: async (name: string, data: any, options?: any) => {
    console.log(`[DEV] Would add job ${name} with data:`, data)
    return Promise.resolve()
  }
}

export const emailQueue = {
  add: async (name: string, data: any, options?: any) => {
    console.log(`[DEV] Would add email job ${name} with data:`, data)
    return Promise.resolve()
  }
}

export async function scheduleFeedPolling() {
  console.log('[DEV] Feed polling would be scheduled in production')
  return Promise.resolve()
}