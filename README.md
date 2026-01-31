# Design YouTube Survey

A production-ready 2-step survey exploring what YouTube channels designers watch. Built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Vercel Postgres.

## Features

- **2-Step Survey Flow**: First select channels you know, then select which ones you actually watch
- **Strict Validation**: Watched channels must be a subset of known channels (enforced in UI and server)
- **Channel Suggestions**: Users can add missing channels (marked as pending until reviewed)
- **Anti-Abuse Protection**: Fingerprint-based rate limiting, honeypot fields, timing validation
- **Admin Dashboard**: Protected results page with aggregated statistics
- **Dark Mode**: Editorial, minimal design matching d1s1.com aesthetic

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Server Actions
- Prisma ORM
- Vercel Postgres

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Vercel account (for Postgres)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ds-survey.git
cd ds-survey
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
# Database (get from Vercel Postgres dashboard)
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Security
FINGERPRINT_SALT="generate-a-random-32-char-string"
ADMIN_PASSWORD="your-secure-admin-password"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. Set up the database:
```bash
pnpm db:push      # Create tables
pnpm db:seed      # Seed with 68 design channels
```

6. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Vercel Deployment

### 1. Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection strings

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ds-survey)

Or deploy manually:

```bash
vercel
```

### 3. Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

- `POSTGRES_PRISMA_URL` (from Vercel Postgres)
- `POSTGRES_URL_NON_POOLING` (from Vercel Postgres)
- `FINGERPRINT_SALT` (generate with `openssl rand -hex 16`)
- `ADMIN_PASSWORD` (your secure password)

### 4. Run Migrations

After first deployment:

```bash
vercel env pull .env.production.local
pnpm db:migrate:deploy
pnpm db:seed
```

## Project Structure

```
ds-survey/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed 68 design channels
├── src/
│   ├── actions/          # Server actions
│   │   ├── admin.ts      # Admin dashboard data
│   │   ├── channels.ts   # Channel CRUD
│   │   └── survey.ts     # Survey submission
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx      # Landing page
│   │   └── survey/
│   │       └── design-youtube/
│   │           ├── page.tsx      # Survey flow
│   │           └── results/
│   │               └── page.tsx  # Admin results
│   ├── components/
│   │   ├── results/      # Admin dashboard
│   │   ├── survey/       # Survey components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts         # Prisma client
│   │   ├── fingerprint.ts
│   │   ├── utils.ts
│   │   └── validation.ts
│   └── middleware.ts     # Timestamp cookie
├── .env.example
└── package.json
```

## Database Schema

### channels
- `id` (uuid, primary key)
- `name` (string)
- `slug` (string, unique)
- `youtube_url` (string, nullable)
- `status` (enum: approved | pending)
- `created_at` (timestamp)

### submissions
- `id` (uuid, primary key)
- `fingerprint_hash` (string, indexed)
- `known_channels` (jsonb array of channel ids)
- `watched_channels` (jsonb array of channel ids)
- `user_agent` (string, nullable)
- `created_at` (timestamp)

### channel_suggestions
- `id` (uuid, primary key)
- `name` (string)
- `youtube_url` (string, nullable)
- `note` (string, nullable)
- `fingerprint_hash` (string, indexed)
- `created_at` (timestamp)

## Validation Rules

- **Known channels**: Max 40 selections
- **Watched channels**: Max 25 selections
- **Watched ⊆ Known**: Server enforces this subset rule
- **Rate limiting**: 1 submission per fingerprint per 24 hours
- **Channel suggestions**: Max 5 per fingerprint per 24 hours
- **Timing**: Minimum 4 seconds between page load and submit

## Admin Dashboard

Access at `/survey/design-youtube/results`

- Protected by `ADMIN_PASSWORD` environment variable
- Shows aggregated statistics (no individual submission data)
- noindex, nofollow for search engines

## License

MIT
