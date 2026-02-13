# Troop 78 — Full Rebuild Plan

**Project:** Troop 78 Scout Management Platform — Production Rebuild
**Team Size:** 6 people
**Approach:** AI-assisted development with structured phase coordination
**Branch Strategy:** `main` (protected) → feature branches → PRs required for merge

---

## Why We Are Rebuilding

The current MVP is a well-designed prototype but is built entirely on mock data with no real backend, no authentication, no persistent storage, and no actual integrations. The rebuild converts this into a production-grade application with a real database, real auth (email or phone number), real file storage, real communication pipelines, an AI assistant, and a non-technical admin management panel — while preserving the design language, branding, and feature set that was already designed.

### Core Design Principles for This Rebuild
1. **Public + Private split** — Some pages are fully public (landing, trips list, newsletters). Sensitive data lives behind login.
2. **Auth flexibility** — Members log in via email (magic link or password) OR phone number (SMS OTP). No one is forced to remember a password.
3. **Non-technical management** — Every admin task has a visual interface. No coding required to run the site.
4. **AI-first** — The AI assistant is a first-class feature, not an afterthought. It should be accessible on every page.

---

## Tech Stack Decision

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Keep existing — well structured |
| Language | TypeScript | Keep existing |
| Styling | Tailwind CSS + shadcn/ui | Keep existing pattern, formalize component library |
| Database | PostgreSQL via Supabase | Managed, free tier, built-in Row Level Security |
| ORM | Prisma | Type-safe queries, great with Next.js |
| Auth | NextAuth.js v5 (Auth.js) | Flexible, supports email magic link, password, phone OTP, OAuth |
| Phone OTP | Twilio Verify | SMS one-time codes for phone number login |
| File Storage | Supabase Storage | Integrated with DB, handles large photo archives |
| Real-time | Supabase Realtime | For communication center live updates |
| AI / OCR | OpenAI API (GPT-4o Vision) | Photo tagging, face context, newsletter OCR |
| Email | Resend | Simple API, great developer experience |
| SMS | Twilio | Industry standard for programmatic SMS |
| Push Notifications | Web Push (via Novu or custom service worker) | PWA-ready push notifications |
| Deployment | Vercel | Native Next.js hosting |
| CI/CD | GitHub Actions | Automated lint, type-check, test on every PR |

---

## Team Roles

| Person | Role | Ownership |
|---|---|---|
| **Person A** | Project Lead + Infrastructure | Repo setup, CI/CD, shared types, environment config, PR reviews |
| **Person B** | Backend + Database | Prisma schema, Supabase config, all server actions and API routes |
| **Person C** | Auth + Security | NextAuth setup, RBAC middleware, session handling, role guards |
| **Person D** | UI Foundation | Design system, shared components, layout, navigation, responsive framework |
| **Person E** | Media Features | Photos module, Newsletter module, file upload pipeline, AI integration, AI Assistant |
| **Person F** | Core Features | Roster, Trips, Documents, Communication Center, Admin Management Panel |

---

## Phases Overview

### Phase 1 — Foundation (All blocking work)
Everyone cannot write feature code until this phase is done. Person A leads, others contribute to their area.

- Repo initialized with agreed structure
- Supabase project created and `.env` distributed
- Prisma schema drafted and reviewed by all
- NextAuth wired up with at least one provider working
- Shared TypeScript types published in `/types`
- CI/CD pipeline running (lint + typecheck on every push)
- Design system initialized (Tailwind config + base components)

**Blocker:** No one starts Phase 2 until Person A signs off on the foundation.

---

### Phase 2 — Parallel Feature Development
All 6 people work simultaneously on their assigned modules. This is the longest phase. Coordination happens through:

- Daily async check-in in a shared channel (Discord/Slack)
- Every PR must have at least one reviewer other than the author
- Shared types live in `/types/index.ts` — any changes must be PRed and reviewed by Person A and Person B before merging
- All data access goes through server actions (`/app/actions/`) — no direct DB calls from client components

---

### Phase 3 — Integration + Wiring
Feature code is complete. Now we connect the pieces:

- Auth gates wired to all role-restricted pages
- File uploads connected to real Supabase storage
- Communication center sending real emails/SMS
- AI photo tagging running against real uploads
- Permission slips connected to document vault
- Global search connected to real DB

---

### Phase 4 — QA + Polish
- All roles tested end to end (admin, scoutmaster, SPL, patrol leader, parent, scout)
- Mobile responsiveness pass
- Performance audit (Core Web Vitals)
- Security review (RBAC rules, exposed routes, file access)
- Final staging deploy to Vercel preview URL for troop leader review

---

## Project File Structure (Target)

```
troop78/
├── app/
│   ├── (public)/                 # Public routes — no login required
│   │   ├── layout.tsx            # Public layout with nav + login button
│   │   ├── page.tsx              # Public landing page
│   │   ├── trips/page.tsx        # Public trips list (no private details)
│   │   └── newsletters/page.tsx  # Public newsletter archive
│   ├── (auth)/                   # Auth routes (login, register, forgot-password)
│   │   ├── login/page.tsx        # Email or phone login
│   │   ├── register/page.tsx     # Invite-only registration
│   │   └── layout.tsx
│   ├── (dashboard)/              # All protected routes — login required
│   │   ├── layout.tsx            # Auth guard + navigation wrapper
│   │   ├── page.tsx              # Member home dashboard
│   │   ├── roster/page.tsx
│   │   ├── trips/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── photos/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── communication/page.tsx
│   │   ├── newsletters/page.tsx  # Enhanced version with private features
│   │   ├── assistant/page.tsx    # AI Assistant full page
│   │   └── admin/                # Admin management panel
│   │       ├── page.tsx          # Admin dashboard / pending tasks
│   │       ├── users/page.tsx    # User management
│   │       ├── content/page.tsx  # Content editor
│   │       └── settings/page.tsx # Site settings
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/phone-otp/route.ts  # Phone number OTP send/verify
│   │   ├── upload/route.ts
│   │   ├── ai/tag-photo/route.ts
│   │   ├── ai/ocr-newsletter/route.ts
│   │   ├── ai/assistant/route.ts    # AI assistant chat endpoint
│   │   └── webhooks/
│   └── actions/                  # Server Actions
│       ├── roster.ts
│       ├── trips.ts
│       ├── photos.ts
│       ├── documents.ts
│       ├── communication.ts
│       ├── newsletters.ts
│       ├── assistant.ts          # AI assistant context builder
│       └── admin.ts              # Admin management actions
├── components/
│   ├── ui/                       # Base design system (shadcn)
│   ├── layout/                   # Navigation, sidebar, header
│   ├── roster/                   # Roster-specific components
│   ├── trips/                    # Trip-specific components
│   ├── photos/                   # Photo-specific components
│   ├── documents/                # Document-specific components
│   ├── communication/            # Message-specific components
│   ├── newsletters/              # Newsletter-specific components
│   ├── assistant/                # AI assistant chat widget + page
│   └── admin/                    # Admin panel components
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Prisma client singleton
│   ├── supabase.ts               # Supabase client (storage)
│   ├── permissions.ts            # RBAC helpers
│   ├── ai.ts                     # OpenAI helpers (tagging, OCR, assistant)
│   ├── email.ts                  # Resend helpers
│   ├── sms.ts                    # Twilio helpers
│   └── utils.ts                  # General utilities
├── prisma/
│   ├── schema.prisma             # Full DB schema
│   └── seed.ts                   # Seed script (replicates mock-db data)
├── types/
│   └── index.ts                  # ALL shared TypeScript types (source of truth)
├── middleware.ts                 # Route protection middleware
├── .env.local                    # Local secrets
└── .env.example                  # Committed template showing required vars
```

---

## Database Schema Overview (Prisma)

```
User              — id, email, phone, name, role, rank, patrol, address, medicalStatus
                    (email OR phone required — either can be used to log in)
Account           — NextAuth OAuth accounts
Session           — NextAuth sessions
VerificationToken — NextAuth email/phone verification tokens
PhoneOTP          — id, phone, code, expiresAt (short-lived OTP for phone login)
Patrol            — id, name, leaderId
Trip              — id, name, destination, dates, cost, maxParticipants, status
TripAttendee      — userId, tripId (join table)
PermissionSlip    — id, userId, tripId, signedAt, signatureData, status
Photo             — id, storageKey, url, thumbnailUrl, event, date, confidenceScore
PhotoTag          — id, photoId, tag, source (ai|manual), verified
PhotoFace         — id, photoId, userId, confidence
Document          — id, name, type, storageKey, uploadedBy, status, expirationDate
Newsletter        — id, title, date, storageKey, thumbnailUrl, extractedText
BlastMessage      — id, title, content, senderId, recipients, channels, isEmergency
MessageRead       — userId, messageId, readAt
AiChatMessage     — id, userId, role (user|assistant), content, createdAt
SiteContent       — id, key, value, updatedBy, updatedAt (for admin content edits)
```

---

## Shared Types (types/index.ts)

All team members import from this file. No one defines their own Role or User type locally.

```typescript
export type UserRole = 'admin' | 'scoutmaster' | 'spl' | 'aspl' | 'patrol_leader' | 'parent' | 'scout'
export type DocumentStatus = 'pending' | 'approved' | 'rejected'
export type TripStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'
export type PermissionSlipStatus = 'not_signed' | 'signed' | 'approved'
export type MessageChannel = 'email' | 'sms' | 'push'
export type TagSource = 'ai' | 'manual'
export type AiChatRole = 'user' | 'assistant'
export type AuthMethod = 'email' | 'phone'
// ... all other shared types
```

---

## Git Workflow

1. `main` is protected — no direct pushes
2. Each task gets a branch: `feature/person-a-ci-setup`, `feature/person-b-prisma-schema`, etc.
3. PR titles follow: `[PersonX] Brief description`
4. All PRs need 1 approval before merge
5. Person A is the default reviewer for infrastructure/type changes
6. Squash merge to keep main history clean

---

## Environment Variables Required

```
# Database
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
AUTH_GOOGLE_ID=           # Optional OAuth
AUTH_GOOGLE_SECRET=       # Optional OAuth

# AI
OPENAI_API_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=

# SMS (blast messages)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Phone OTP auth (can use Twilio Verify service instead of raw SMS)
TWILIO_VERIFY_SERVICE_SID=
```

---

## Coordination Checkpoints

| Checkpoint | Trigger | Who |
|---|---|---|
| Schema Review | Before Person B runs first migration | All 6 review schema.prisma |
| Types Freeze | Before Phase 2 begins | Person A calls freeze, all review types/index.ts |
| Auth Gate Review | Before any role-gated feature is built | Person C demos auth + RBAC to all |
| Integration Day | Phase 3 begins | Full team sync, resolve cross-module dependencies |
| Final Review | Before staging deploy | Person A does full review pass |

---

## AI-Assisted Development Notes

Since all team members are using AI to write code, establish these ground rules:

1. **Always prompt with types first.** Share the contents of `types/index.ts` in your AI prompt context so generated code uses the correct types.
2. **Always prompt with the schema.** Include the relevant Prisma models when asking AI to write server actions or queries.
3. **Don't let AI create new files outside the agreed structure.** If AI suggests a new file location, confirm with Person A first.
4. **Paste the permissions.ts helper** into your prompt when writing role-gated UI components.
5. **Review AI output for hardcoded values.** AI often invents fake API keys, URLs, or magic strings. Always check.
6. **Commit frequently.** Small, atomic commits make it easy to revert AI mistakes.
7. **Don't merge AI-generated code without reading it.** Even if it works, understand what it does.
