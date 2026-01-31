# Design YouTube Survey

Опрос о том, какие YouTube-каналы смотрят дизайнеры. Проект от d1s1 и клуба Дорогие дизайнеры.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma + Vercel Postgres
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Redirects to survey
│   └── survey/design-youtube/
│       ├── page.tsx       # Main survey (2 steps)
│       └── results/page.tsx  # Admin dashboard
├── actions/               # Server Actions
│   ├── channels.ts        # Get channels, add suggestions
│   ├── survey.ts          # Submit survey
│   └── admin.ts           # Admin results
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── survey/           # Survey flow components
│   └── results/          # Admin dashboard
└── lib/
    ├── db.ts             # Prisma client
    ├── fingerprint.ts    # Anti-abuse fingerprinting
    ├── validation.ts     # Zod schemas
    └── utils.ts          # Helpers
```

## Key Concepts

### Survey Flow
1. **Step 1 (Awareness)**: Select known channels
2. **Step 2 (Watching)**: Select watched channels (subset of known)
3. Server validates `watched ⊆ known`

### Anti-Abuse
- Fingerprint = hash(IP + User-Agent + salt)
- 1 submission per fingerprint per 24h
- 4 second minimum time on page
- Honeypot field
- Rate-limited channel suggestions (5/day)

### Data Model
- `channels`: Approved + pending channels
- `submissions`: User responses (JSONB arrays)
- `channel_suggestions`: User-submitted channels for review

## Commands

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed channels (clears existing)
pnpm db:studio        # Prisma Studio
```

## Environment Variables

```
DATABASE_URL          # Prisma Postgres connection
PRISMA_DATABASE_URL   # Direct connection for migrations
FINGERPRINT_SALT      # Random string for hashing
ADMIN_PASSWORD        # Admin dashboard access
```

## Design

- Inspired by d1s1.com and are.na
- Minimal, editorial aesthetic
- Light/dark mode (follows system)
- Russian language UI

## Notes

- Seed runs on every Vercel build (uses upsert logic)
- Admin dashboard at `/survey/design-youtube/results`
- Channels show @handle extracted from YouTube URL
