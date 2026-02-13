# Person A — Project Lead + Infrastructure

**Role:** Project Lead, Repository Architecture, CI/CD, Shared Types, PR Reviews
**Phase Ownership:** Leads Phase 1, reviews all phases, unblocks team

---

## Your Job in One Sentence

You are the foundation that everyone else builds on. Nothing in Phase 2 starts until your work is done. You also own the "glue" — the shared types, the CI pipeline, the repo structure, and the `.env` coordination that makes everyone's code fit together.

---

## Phase 1 Tasks (Complete These First — Team Is Blocked Until Done)

### Task 1.1 — Initialize the New Repository

Create a fresh Next.js 15 project with the agreed structure.

```bash
npx create-next-app@latest troop78-v2 --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

Then immediately set up the folder structure from `generalplan.md`:
- Create: `app/(public)/`, `app/(auth)/`, `app/(dashboard)/`, `app/api/`, `app/actions/`
- Create: `components/ui/`, `components/layout/`, `components/roster/`, `components/trips/`, `components/photos/`, `components/documents/`, `components/communication/`, `components/newsletters/`, `components/assistant/`, `components/admin/`
- Create: `lib/`, `types/`, `prisma/`
- Add placeholder `index.ts` files in each so they appear in git

**AI Prompt Tip:** Ask your AI assistant to generate the full folder scaffolding as a bash script you can review and run.

---
The 
### Task 1.2 — Install Core Dependencies

```bash
# Database
npm install prisma @prisma/client
npm install @supabase/supabase-js

# Auth
npm install next-auth@beta

# UI Components (shadcn)
npx shadcn@latest init

# Utilities
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react
npm install framer-motion
npm install react-signature-canvas @types/react-signature-canvas

# Email / SMS
npm install resend twilio

# AI
npm install openai

# Dev
npm install -D @types/node
```

After installing, commit a `package.json` lockfile snapshot so everyone uses the same versions.

---

### Task 1.3 — Write `types/index.ts`

This is the most critical file you will write. Every team member imports from here. Get it right before Phase 2 begins.

Note the new additions: `AuthMethod` for email vs phone login, `AiChatRole` for the AI assistant, and `SiteContent` for the admin content editor.

Write out all shared types based on the Prisma schema (coordinate with Person B):

```typescript
// types/index.ts

export type UserRole =
  | 'admin'
  | 'scoutmaster'
  | 'spl'
  | 'aspl'
  | 'patrol_leader'
  | 'parent'
  | 'scout'

export type DocumentStatus = 'pending' | 'approved' | 'rejected'
export type TripStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'
export type PermissionSlipStatus = 'not_signed' | 'signed' | 'approved'
export type MessageChannel = 'email' | 'sms' | 'push'
export type TagSource = 'ai' | 'manual'
export type MedicalStatus = 'complete' | 'pending' | 'missing'
export type AiChatRole = 'user' | 'assistant'
export type AuthMethod = 'email' | 'phone'

export interface User {
  id: string
  name: string
  email?: string    // Optional — user may log in via phone only
  phone?: string    // Optional — user may log in via email only
  role: UserRole
  rank?: string
  patrol?: string
  address?: string
  medicalStatus?: MedicalStatus
  joinDate?: string
  eagleDate?: string
  image?: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  cost: number
  imageUrl?: string
  description: string
  requirements: string[]
  status: TripStatus
  maxParticipants?: number
}

export interface Photo {
  id: string
  url: string
  thumbnailUrl?: string
  date: string
  event: string
  aiTags: string[]
  verifiedTags: string[]
  confidenceScore: number
  location?: string
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadDate: string
  uploadedBy: string
  status: DocumentStatus
  expirationDate?: string
  associatedTrip?: string
}

export interface Newsletter {
  id: string
  title: string
  date: string
  url: string
  thumbnailUrl?: string
  excerpt: string
  searchableContent: string
  month: string
  year: number
}

export interface BlastMessage {
  id: string
  title: string
  content: string
  sender: string
  recipients: string[]
  channels: MessageChannel[]
  isEmergency: boolean
  sentDate: string
  readBy: string[]
}

export interface PermissionSlip {
  id: string
  userId: string
  tripId: string
  signedAt?: string
  signatureData?: string
  status: PermissionSlipStatus
}

// Session extension for NextAuth
export interface AppUser extends User {
  sessionId?: string
}
```

Push this file and tag it: `types-v1`. Announce in the team channel that it's ready.

---

### Task 1.4 — Write `.env.example`

Create a committed `.env.example` that shows every required variable with no real values. This is the contract between team members.

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/troop78

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Optional OAuth
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# AI
OPENAI_API_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@troop78.org

# SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Distribute the real `.env.local` values to each team member via a secure channel (1Password, Bitwarden, or direct DM — never commit real secrets).

---

### Task 1.5 — Set Up CI/CD with GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: ['*']
  pull_request:
    branches: ['main']

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
```

Set up GitHub branch protection on `main`:
- Require PR before merging
- Require CI to pass
- Require at least 1 reviewer approval

**AI Prompt Tip:** Ask AI to generate the full GitHub Actions YAML for a Next.js + Prisma project with TypeScript type checking.

---

### Task 1.6 — Write `lib/utils.ts` and `lib/permissions.ts`

Port and improve the existing permissions helpers from the MVP into production-ready versions:

**`lib/permissions.ts`** — This is the single source of truth for what each role can do:

```typescript
import type { UserRole } from '@/types'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 7,
  scoutmaster: 6,
  spl: 5,
  aspl: 4,
  patrol_leader: 3,
  parent: 2,
  scout: 1,
}

export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

export function canViewPhoneNumber(role: UserRole, targetPatrol?: string, viewerPatrol?: string): boolean { ... }
export function canViewAddress(role: UserRole): boolean { ... }
export function canViewMedicalStatus(role: UserRole): boolean { ... }
export function canSendBlast(role: UserRole): boolean { ... }
export function canSendEmergencyBlast(role: UserRole): boolean { ... }
export function canEditRoster(role: UserRole): boolean { ... }
export function canApproveDocuments(role: UserRole): boolean { ... }
export function canViewFullRoster(role: UserRole): boolean { ... }
```

Push with tag `permissions-v1`. Announce to team.

---

## Phase 2 Tasks (Ongoing — During Feature Development)

### Task 2.1 — PR Reviews

You are the default reviewer for:
- Any change to `types/index.ts`
- Any change to `lib/permissions.ts`
- Any change to `middleware.ts`
- Any change to `.github/workflows/`
- Any change to `prisma/schema.prisma` (co-review with Person B)

When reviewing:
- Check that types are correct and not duplicated
- Check that no client component imports from server-only modules
- Check that no hardcoded secrets or fake data remain

---

### Task 2.2 — Tailwind Config + Global Styles

Port the existing `tailwind.config.ts` design tokens to the new project:

- Keep the maroon (#800000) and gold (#FFD700) palette
- Keep `troop-*` CSS utility classes in `globals.css`
- Keep custom animations: `terminal`, `slide-up`, `pulse-slow`
- Ensure `Inter` and `JetBrains Mono` font families are configured

Coordinate with Person D, who will use these tokens in their component library.

---

### Task 2.3 — `next.config.js` and Project Config

Write the production `next.config.js` with:
- Image domains for Supabase storage
- Any required headers (CSP, CORS for API routes)
- Environment variable validation (throw at startup if required vars missing)

---

### Task 2.4 — Seed Script

Write `prisma/seed.ts` that populates the DB with realistic test data, porting from the existing `data/mock-db.ts`. This lets everyone develop locally against real data.

Work with Person B on the exact format once the schema is finalized.

---

## Phase 3 Tasks (Integration)

### Task 3.1 — Middleware

Write `middleware.ts` — the gatekeeper between public and private. This is critical: public pages (`/`, `/trips`, `/newsletters`) must stay open to everyone. Only dashboard routes require login.

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Always public — no login needed
const PUBLIC_PATHS = ['/', '/trips', '/newsletters']
// Auth pages — for unauthenticated users only
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']
// Require login
const PROTECTED_PREFIXES = ['/dashboard', '/roster', '/photos', '/documents', '/communication', '/assistant', '/admin']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const path = nextUrl.pathname

  if (PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))) return NextResponse.next()
  if (path.startsWith('/api/auth')) return NextResponse.next()

  if (AUTH_PATHS.some(p => path.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (PROTECTED_PREFIXES.some(p => path.startsWith(p)) && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

Coordinate with Person C who owns the full auth logic inside the middleware.

---

### Task 3.2 — Staging Deploy

Set up Vercel project:
- Connect GitHub repo
- Configure all environment variables in Vercel dashboard
- Set up preview deployments for PRs
- Share staging URL with the troop for feedback

---

## Deliverables Checklist

- [ ] Repo initialized with full agreed folder structure
- [ ] All dependencies installed, `package-lock.json` committed
- [ ] `types/index.ts` written, tagged, and announced
- [ ] `.env.example` committed
- [ ] `.env.local` values distributed securely
- [ ] GitHub Actions CI running on all PRs
- [ ] Branch protection on `main` configured
- [ ] `lib/permissions.ts` written and tagged
- [ ] `lib/utils.ts` ported
- [ ] Tailwind config ported with troop branding
- [ ] `next.config.js` production-ready
- [ ] Seed script written (after Person B finalizes schema)
- [ ] `middleware.ts` protecting dashboard routes
- [ ] Vercel staging deploy live

---

## AI Prompting Tips for Your Role

**For generating the folder structure:**
> "Generate a bash script that creates the following folder structure for a Next.js 15 app router project: [paste structure from generalplan.md]. Include placeholder index.ts files in each folder."

**For writing types:**
> "Given this Prisma schema: [paste schema], generate a complete TypeScript types/index.ts file with all shared interfaces and union types. Use string for all date fields. Do not use Prisma's generated types directly — create independent interface definitions."

**For CI/CD:**
> "Write a GitHub Actions workflow for a Next.js 15 TypeScript project that runs on every push and PR to main. It should: install dependencies with npm ci, run eslint, run tsc --noEmit for type checking, and run next build."

**For permissions:**
> "Write a TypeScript permissions.ts file for a role-based access control system with these roles in order of authority: admin, scoutmaster, spl, aspl, patrol_leader, parent, scout. Include a hasMinimumRole helper and individual permission functions for: viewing phone numbers (with patrol-based rules), viewing addresses, viewing medical status, sending blast messages, sending emergency blasts, editing the roster, and approving documents."
