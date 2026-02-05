# Briefly

An AI-powered RSS digest application that summarizes your feeds and delivers personalized email digests.

## Features

- **RSS Feed Management**: Subscribe to any RSS feed with automatic article fetching
- **AI Summarization**: Claude-powered article summaries with customizable prompts
- **Podcast Transcription**: Whisper AI transcription with Q&A and citation support
- **Email Digests**: Scheduled delivery (daily, weekly, biweekly) with Gmail SMTP
- **Feed Categories**: Organize feeds into custom folders with color coding
- **Full-Text Search**: Search across articles, feeds, and transcripts
- **OPML Import/Export**: Import from and export to other RSS readers
- **Bookmarks**: Save articles for later with notes
- **Read Tracking**: Mark articles as read/unread

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with Google OAuth
- **AI**: Anthropic Claude (summaries), OpenAI Whisper (transcription)
- **Email**: Nodemailer with Gmail SMTP
- **Styling**: Tailwind CSS
- **Queue**: BullMQ with Redis (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Cloud Console project (for OAuth)
- Anthropic API key
- OpenAI API key (for transcription)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/briefly-mvp.git
cd briefly-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
briefly-mvp/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Authenticated dashboard pages
│   │   ├── articles/       # Article list
│   │   ├── dashboard/      # Main dashboard
│   │   ├── digest/         # Digest preview
│   │   ├── feeds/          # Feed management
│   │   ├── preferences/    # User preferences
│   │   ├── prompts/        # Custom AI prompts
│   │   ├── subscriptions/  # Subscription management
│   │   └── transcripts/    # Podcast transcripts
│   ├── api/                # API routes
│   │   ├── articles/       # Article endpoints
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── bookmarks/      # Bookmark endpoints
│   │   ├── categories/     # Category CRUD
│   │   ├── digest/         # Digest generation
│   │   ├── feeds/          # Feed management
│   │   ├── opml/           # OPML import/export
│   │   ├── prompts/        # Prompt management
│   │   ├── search/         # Full-text search
│   │   ├── subscriptions/  # Subscription endpoints
│   │   └── transcripts/    # Transcript & transcription
│   └── auth/               # Auth pages
├── components/             # React components
│   ├── digest/             # Digest components
│   ├── feeds/              # Feed components
│   ├── layout/             # Layout components
│   ├── onboarding/         # Onboarding modals
│   ├── preferences/        # Preference components
│   ├── prompts/            # Prompt editor
│   └── ui/                 # UI primitives
├── lib/                    # Utility libraries
│   ├── auth.ts             # Auth configuration
│   ├── claude.ts           # Claude AI integration
│   ├── email.ts            # Email sending
│   ├── opml.ts             # OPML parsing/generation
│   ├── prisma.ts           # Prisma client
│   ├── scheduler.ts        # Digest scheduling
│   └── whisper.ts          # Whisper transcription
├── prisma/
│   └── schema.prisma       # Database schema
└── types/                  # TypeScript types
```

## API Endpoints

### Feeds
- `GET /api/feeds` - List subscribed feeds
- `POST /api/feeds` - Add new feed

### Articles
- `GET /api/articles` - List articles
- `POST /api/articles/state` - Mark read/unread
- `PATCH /api/articles/state` - Batch mark read

### Bookmarks
- `GET /api/bookmarks` - List bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks` - Remove bookmark

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Search
- `GET /api/search?q=query` - Search articles, feeds, transcripts

### OPML
- `GET /api/opml/export` - Export feeds as OPML
- `POST /api/opml/import` - Import OPML file

### Transcripts
- `GET /api/transcripts` - List transcripts
- `GET /api/transcripts/[id]` - Get transcript details
- `POST /api/transcripts/transcribe` - Trigger transcription
- `POST /api/transcripts/[id]/ask` - Ask question with citations

### Digest
- `GET /api/digest/preview` - Preview digest
- `POST /api/digest/send-test` - Send test digest
- `POST /api/digest/process` - Process scheduled digests (cron)

## Scheduled Digests

To enable automated digest delivery, set up a cron job to call:

```bash
curl -X POST https://your-domain.com/api/digest/process \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

Recommended: Every 15 minutes via Vercel Cron, Railway, or external service.

## Environment Variables

See `.env.example` for all required and optional variables.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t briefly .
docker run -p 3000:3000 --env-file .env briefly
```

## License

MIT
