# Person B — Backend + Database

**Role:** Database Schema, Prisma ORM, Supabase Setup, Server Actions, API Routes
**Phase Ownership:** Phase 1 schema design, Phase 2 all data layer, Phase 3 integration support

---

## Your Job in One Sentence

You own everything between the database and the UI. Every piece of data that enters or leaves the system goes through code you write. Server actions, API routes, Prisma queries, Supabase storage config — all yours.

---

## Phase 1 Tasks (Do These Before Phase 2 Starts)

### Task 1.1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project named `troop78`
2. Grab the following from the Supabase dashboard and give them to Person A for `.env.local` distribution:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (from Settings > Database > Connection string > URI)
3. In Supabase Storage, create these buckets:
   - `photos` — public read, authenticated write
   - `documents` — private (authenticated read + write only)
   - `newsletters` — public read, authenticated write
   - `thumbnails` — public read, authenticated write
4. Set up Row Level Security (RLS) policies on each bucket

---

### Task 1.2 — Write the Prisma Schema

Initialize Prisma and write the full schema. This is the most important deliverable of Phase 1 — get everyone to review it before running the first migration.

```bash
npx prisma init
```

**`prisma/schema.prisma`:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  admin
  scoutmaster
  spl
  aspl
  patrol_leader
  parent
  scout
}

enum DocumentStatus {
  pending
  approved
  rejected
}

enum TripStatus {
  upcoming
  active
  completed
  cancelled
}

enum PermissionSlipStatus {
  not_signed
  signed
  approved
}

enum MessageChannel {
  email
  sms
  push
}

enum TagSource {
  ai
  manual
}

enum MedicalStatus {
  complete
  pending
  missing
}

// New model for phone number OTP login
model PhoneOTP {
  id        String   @id @default(cuid())
  phone     String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([phone])
}

// Admin editable site content (meeting times, descriptions, etc.)
model SiteContent {
  id        String   @id @default(cuid())
  key       String   @unique  // e.g. "meeting_location", "troop_description"
  value     String   @db.Text
  updatedBy String
  updatedAt DateTime @updatedAt
}

// AI assistant chat history per user
model AiChatMessage {
  id        String      @id @default(cuid())
  userId    String
  role      String      // "user" or "assistant"
  content   String      @db.Text
  createdAt DateTime    @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String?   @unique   // Optional — can log in via phone instead
  phone         String?   @unique   // Optional — can log in via email instead
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(scout)
  rank          String?
  patrol        String?
  address       String?
  medicalStatus MedicalStatus?
  joinDate      DateTime?
  eagleDate     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts        Account[]
  sessions        Session[]
  tripAttendees   TripAttendee[]
  permissionSlips PermissionSlip[]
  uploadedDocs    Document[]
  sentMessages    BlastMessage[]
  messageReads    MessageRead[]
  photoFaces      PhotoFace[]
  aiChatMessages  AiChatMessage[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Trip {
  id              String     @id @default(cuid())
  name            String
  destination     String
  startDate       DateTime
  endDate         DateTime
  cost            Float
  imageStorageKey String?
  description     String     @db.Text
  requirements    String[]
  status          TripStatus @default(upcoming)
  maxParticipants Int?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  attendees       TripAttendee[]
  permissionSlips PermissionSlip[]
}

model TripAttendee {
  userId    String
  tripId    String
  user      User   @relation(fields: [userId], references: [id])
  trip      Trip   @relation(fields: [tripId], references: [id])

  @@id([userId, tripId])
}

model PermissionSlip {
  id            String               @id @default(cuid())
  userId        String
  tripId        String
  signedAt      DateTime?
  signatureData String?              @db.Text
  status        PermissionSlipStatus @default(not_signed)
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  user User @relation(fields: [userId], references: [id])
  trip Trip @relation(fields: [tripId], references: [id])

  @@unique([userId, tripId])
}

model Photo {
  id              String   @id @default(cuid())
  storageKey      String   @unique
  url             String
  thumbnailUrl    String?
  date            DateTime
  event           String
  confidenceScore Float    @default(0)
  location        String?
  createdAt       DateTime @default(now())

  tags  PhotoTag[]
  faces PhotoFace[]
}

model PhotoTag {
  id      String    @id @default(cuid())
  photoId String
  tag     String
  source  TagSource @default(ai)
  verified Boolean  @default(false)
  photo   Photo     @relation(fields: [photoId], references: [id], onDelete: Cascade)

  @@unique([photoId, tag])
}

model PhotoFace {
  id         String  @id @default(cuid())
  photoId    String
  userId     String?
  confidence Float
  boundingBox Json?
  photo      Photo   @relation(fields: [photoId], references: [id], onDelete: Cascade)
  user       User?   @relation(fields: [userId], references: [id])
}

model Document {
  id              String         @id @default(cuid())
  name            String
  type            String
  storageKey      String         @unique
  url             String
  uploadedById    String
  status          DocumentStatus @default(pending)
  expirationDate  DateTime?
  associatedTripId String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  uploadedBy User @relation(fields: [uploadedById], references: [id])
}

model Newsletter {
  id               String   @id @default(cuid())
  title            String
  date             DateTime
  storageKey       String   @unique
  thumbnailUrl     String?
  excerpt          String
  extractedText    String   @db.Text
  createdAt        DateTime @default(now())
}

model BlastMessage {
  id          String           @id @default(cuid())
  title       String
  content     String           @db.Text
  senderId    String
  recipients  String[]
  channels    MessageChannel[]
  isEmergency Boolean          @default(false)
  sentAt      DateTime         @default(now())

  sender    User          @relation(fields: [senderId], references: [id])
  readBy    MessageRead[]
}

model MessageRead {
  userId    String
  messageId String
  readAt    DateTime     @default(now())

  user    User         @relation(fields: [userId], references: [id])
  message BlastMessage @relation(fields: [messageId], references: [id])

  @@id([userId, messageId])
}
```

After writing this:
1. Slack/message the team with the schema for review
2. Wait for sign-off from Person A and at least 2 others
3. Only then run: `npx prisma migrate dev --name init`
4. Commit the migration file

---

### Task 1.3 — Initialize Supabase Client

**`lib/supabase.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase (anon key, public operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase (service role, bypasses RLS — use only in server actions/API routes)
export function getSupabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
```

**`lib/db.ts`:**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## Phase 2 Tasks — Server Actions

All data access from the UI goes through server actions in `app/actions/`. No direct Prisma imports in components.

### Task 2.1 — `app/actions/roster.ts`

```typescript
'use server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { canViewFullRoster, canViewAddress, canViewMedicalStatus } from '@/lib/permissions'
import type { User } from '@/types'

export async function getRoster(): Promise<User[]> {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const users = await db.user.findMany({
    orderBy: [{ patrol: 'asc' }, { name: 'asc' }],
  })

  // Apply privacy masking based on role
  return users.map(user => maskUserData(user, session.user.role))
}

export async function updateScout(id: string, data: Partial<User>) {
  const session = await auth()
  if (!session?.user || !canEditRoster(session.user.role)) throw new Error('Forbidden')
  return db.user.update({ where: { id }, data })
}

function maskUserData(user: any, viewerRole: string) {
  // Apply permission-based masking
  if (!canViewAddress(viewerRole as any)) {
    user = { ...user, address: '••••••••' }
  }
  // etc.
  return user
}
```

### Task 2.2 — `app/actions/trips.ts`

Write server actions for:
- `getTrips()` — all trips with attendee counts
- `getTripById(id)` — single trip with full details
- `joinTrip(tripId)` — add current user as attendee
- `getPermissionSlips(tripId)` — for scoutmaster view
- `signPermissionSlip(tripId, signatureData)` — for scouts/parents

### Task 2.3 — `app/actions/documents.ts`

Write server actions for:
- `getDocuments(filter?)` — filtered by type, status, user
- `uploadDocument(formData)` — saves file to Supabase storage, creates DB record
- `approveDocument(id)` — scoutmaster/admin only
- `rejectDocument(id, reason)` — scoutmaster/admin only
- `deleteDocument(id)` — uploader or admin only

### Task 2.4 — `app/actions/communication.ts`

Write server actions for:
- `getMessages()` — all messages (paginated)
- `sendBlast(data)` — create message, trigger email/SMS via Resend/Twilio
- `markRead(messageId)` — mark message as read by current user

### Task 2.5 — `app/actions/admin.ts`

Write server actions for the Admin Management Panel:

```typescript
'use server'
// All functions require requireRole('scoutmaster') or requireRole('admin')

export async function getPendingTasks() {
  // Returns: unsigned permission slips count, pending documents count,
  // expiring documents count, pending user invites count
}

export async function getSiteContent(key: string): Promise<string> {
  // Returns the value for a given content key (e.g. "troop_description")
  // Falls back to a default if the key doesn't exist yet
}

export async function updateSiteContent(key: string, value: string) {
  // Admin/scoutmaster only — update editable site text
}

export async function getAllUsers() {
  // Admin/scoutmaster only — full user list for management
}

export async function updateUserRole(userId: string, role: UserRole) {
  // Admin only
}

export async function deactivateUser(userId: string) {
  // Admin/scoutmaster only — soft delete (set active = false)
}
```

### Task 2.6 — `app/actions/assistant.ts`

Write server actions for the AI assistant:

```typescript
'use server'
// Builds the context the AI needs to answer troop-specific questions

export async function getAssistantContext() {
  // Returns a summary of: upcoming trips, troop stats, current meeting info,
  // and any custom info the admin has added via SiteContent
  // This gets injected as the system prompt for the AI
}

export async function saveMessage(role: 'user' | 'assistant', content: string) {
  // Saves a chat message to AiChatMessage table for the current user
}

export async function getChatHistory(limit = 20) {
  // Returns the last N messages for the current user's conversation
}
```

### Task 2.7 — File Upload API Route

**`app/api/upload/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const bucket = formData.get('bucket') as string

  if (!file || !bucket) return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { data, error } = await supabase.storage.from(bucket).upload(filename, file)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return NextResponse.json({ url: publicUrl, key: data.path })
}
```

---

## Phase 3 Tasks (Integration)

### Task 3.1 — Email Integration (`lib/email.ts`)

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  })
}
```

### Task 3.2 — SMS Integration (`lib/sms.ts`)

```typescript
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS({ to, body }: { to: string; body: string }) {
  return client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
    body,
  })
}
```

### Task 3.3 — Wire Communication Actions to Real Delivery

Update `sendBlast()` in `app/actions/communication.ts` to actually call `sendEmail()` and `sendSMS()` after creating the DB record.

---

## Coordination Notes

- **Depends on:** Person A finishing `types/index.ts` and project setup before you can write server actions
- **Blocks:** Person C (needs DB + Prisma adapter for NextAuth), Person F (needs server actions for roster/trips/documents/communication), Person E (needs server actions for photos/newsletters)
- **Coordinate with Person C:** The `User` model must match what NextAuth expects — review together before final migration
- **Coordinate with Person E:** The `Photo` and `Newsletter` models plus storage buckets must match their AI pipeline

---

## Deliverables Checklist

- [ ] Supabase project created, credentials distributed
- [ ] Storage buckets created with correct RLS policies
- [ ] `prisma/schema.prisma` written and team-reviewed
- [ ] First migration run: `npx prisma migrate dev --name init`
- [ ] `lib/db.ts` (Prisma singleton)
- [ ] `lib/supabase.ts` (Supabase client + admin)
- [ ] Server action: `app/actions/roster.ts`
- [ ] Server action: `app/actions/trips.ts`
- [ ] Server action: `app/actions/documents.ts`
- [ ] Server action: `app/actions/communication.ts`
- [ ] Server action: `app/actions/photos.ts` (coordinate with Person E)
- [ ] Server action: `app/actions/newsletters.ts` (coordinate with Person E)
- [ ] API route: `app/api/upload/route.ts`
- [ ] `lib/email.ts`
- [ ] `lib/sms.ts`
- [ ] Communication server action wired to real delivery
- [ ] Seed script `prisma/seed.ts` (with Person A)

---

## AI Prompting Tips for Your Role

**For the Prisma schema:**
> "Write a complete Prisma schema for a Boy Scout troop management app. Include models for: User (with roles: admin, scoutmaster, spl, aspl, patrol_leader, parent, scout), NextAuth tables (Account, Session, VerificationToken), Trip, TripAttendee, PermissionSlip, Photo, PhotoTag, PhotoFace, Document, Newsletter, BlastMessage, and MessageRead. Use PostgreSQL. Use cuid() for IDs. Include proper relations and cascade deletes."

**For server actions:**
> "Write a Next.js 15 server action file for roster management. Import db from '@/lib/db', auth from '@/lib/auth', and permission helpers from '@/lib/permissions'. The getRoster function should: verify the user is authenticated, fetch all users from the DB ordered by patrol then name, and apply privacy masking based on the viewer's role using the permission helpers. Here are the types: [paste types/index.ts]. Here is the Prisma schema: [paste relevant models]."

**For Supabase storage:**
> "Write TypeScript functions for uploading files to Supabase storage buckets in a Next.js API route. Include proper error handling and return both the storage key and public URL. The function should accept a File object and a bucket name."
