import { parseStringPromise, Builder } from 'xml2js'

export interface OPMLFeed {
  title: string
  xmlUrl: string
  htmlUrl?: string
  description?: string
  category?: string
}

export interface OPMLDocument {
  title: string
  dateCreated: string
  feeds: OPMLFeed[]
}

/**
 * Parse OPML XML content into structured feed data
 */
export async function parseOPML(content: string): Promise<OPMLDocument> {
  const result = await parseStringPromise(content, {
    explicitArray: false,
    mergeAttrs: true,
  })

  const opml = result.opml
  const head = opml.head || {}
  const body = opml.body || {}

  const feeds: OPMLFeed[] = []

  // Recursively extract feeds from outline elements
  function extractFeeds(outline: unknown, parentCategory?: string) {
    if (!outline) return

    const outlines = Array.isArray(outline) ? outline : [outline]

    for (const item of outlines) {
      if (item.xmlUrl) {
        // This is a feed
        feeds.push({
          title: item.title || item.text || 'Untitled Feed',
          xmlUrl: item.xmlUrl,
          htmlUrl: item.htmlUrl,
          description: item.description,
          category: parentCategory,
        })
      } else if (item.outline) {
        // This is a category/folder
        const categoryName = item.title || item.text
        extractFeeds(item.outline, categoryName)
      }
    }
  }

  extractFeeds(body.outline)

  return {
    title: head.title || 'Imported Feeds',
    dateCreated: head.dateCreated || new Date().toISOString(),
    feeds,
  }
}

/**
 * Generate OPML XML from feed data
 */
export function generateOPML(
  feeds: Array<{
    title: string
    url: string
    siteUrl?: string
    category?: string
  }>,
  title: string = 'Briefly Feed Export'
): string {
  // Group feeds by category
  const categorized: Record<string, typeof feeds> = {}
  const uncategorized: typeof feeds = []

  for (const feed of feeds) {
    if (feed.category) {
      if (!categorized[feed.category]) {
        categorized[feed.category] = []
      }
      categorized[feed.category].push(feed)
    } else {
      uncategorized.push(feed)
    }
  }

  // Build outline structure
  const outlines: object[] = []

  // Add categorized feeds
  for (const [category, categoryFeeds] of Object.entries(categorized)) {
    outlines.push({
      $: { text: category, title: category },
      outline: categoryFeeds.map(feed => ({
        $: {
          type: 'rss',
          text: feed.title,
          title: feed.title,
          xmlUrl: feed.url,
          htmlUrl: feed.siteUrl || '',
        }
      }))
    })
  }

  // Add uncategorized feeds
  for (const feed of uncategorized) {
    outlines.push({
      $: {
        type: 'rss',
        text: feed.title,
        title: feed.title,
        xmlUrl: feed.url,
        htmlUrl: feed.siteUrl || '',
      }
    })
  }

  const opmlDoc = {
    opml: {
      $: { version: '2.0' },
      head: {
        title,
        dateCreated: new Date().toUTCString(),
        docs: 'http://opml.org/spec2.opml',
      },
      body: {
        outline: outlines,
      },
    },
  }

  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '  ' },
  })

  return builder.buildObject(opmlDoc)
}
