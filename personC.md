# Person C — Authentication + Security

**Role:** NextAuth.js v5, Session Management, RBAC Middleware, Route Guards, Security Hardening
**Phase Ownership:** Phase 1 auth foundation, Phase 2 role gates on every module, Phase 3 security audit

---

## Your Job in One Sentence

You ensure that only the right people see the right things — nobody gets in without authenticating, nobody sees data above their permission level, and the app is hardened against the most common web vulnerabilities.

---

## Phase 1 Tasks (Complete Before Phase 2 — Team Needs Auth Working)

### Task 1.1 — Install and Configure NextAuth.js v5

NextAuth v5 (Auth.js) works differently from v4. Use the new configuration pattern:

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

**Auth methods to support (both must work independently):**
1. **Email** — Magic link (passwordless) sent to inbox, OR email + password for those who prefer it
2. **Phone number** — SMS OTP via Twilio Verify (6-digit code sent by text, expires in 10 minutes)

A user only needs one of the two. If someone registers with just a phone number, they never need an email address to log in.

**`lib/auth.ts`** — This is the central auth config that everyone imports from:

```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'
import type { UserRole } from '@/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // Email + password login
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.passwordHash) return null

        const isValid = await compare(credentials.password as string, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        }
      },
    }),
    // Optional: Google OAuth
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
})
```

Note: You need to add `passwordHash` to the Prisma schema — coordinate with Person B. Add this field to the `User` model before the first migration runs.

---

### Task 1.2 — NextAuth Route Handler

**`app/api/auth/[...nextauth]/route.ts`:**

```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

---

### Task 1.2b — Phone OTP API Route

Since NextAuth doesn't natively handle phone OTP, build a custom API route that works alongside it.

**`app/api/auth/phone-otp/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { db } from '@/lib/db'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// POST /api/auth/phone-otp/send — send a 6-digit code to a phone number
// POST /api/auth/phone-otp/verify — verify the code and sign the user in

export async function POST(req: NextRequest) {
  const { action, phone, code } = await req.json()

  if (action === 'send') {
    // Verify user exists with this phone
    const user = await db.user.findUnique({ where: { phone } })
    if (!user) return NextResponse.json({ error: 'Phone number not found' }, { status: 404 })

    // Generate 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save to DB (invalidate any existing codes for this phone first)
    await db.phoneOTP.deleteMany({ where: { phone } })
    await db.phoneOTP.create({ data: { phone, code: otp, expiresAt } })

    // Send via Twilio
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
      body: `Your Troop 78 login code is: ${otp}. Expires in 10 minutes.`,
    })

    return NextResponse.json({ success: true })
  }

  if (action === 'verify') {
    const record = await db.phoneOTP.findFirst({
      where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    })
    if (!record) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })

    // Mark code as used
    await db.phoneOTP.update({ where: { id: record.id }, data: { used: true } })

    // Sign the user in using NextAuth's signIn with credentials
    const user = await db.user.findUnique({ where: { phone } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Return user info for the client to call NextAuth signIn
    return NextResponse.json({ success: true, userId: user.id, email: user.email })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
```

The login page (Person C's Task 2.1) will call this route, then use the returned userId to complete sign-in via a special credentials provider in NextAuth.

---

### Task 1.3 — Extend TypeScript Session Types

Create a type augmentation file so TypeScript knows about `id` and `role` on the session:

**`types/next-auth.d.ts`:**

```typescript
import type { DefaultSession } from 'next-auth'
import type { UserRole } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
```

---

### Task 1.4 — Route Protection Middleware

**`middleware.ts`** (root of project — coordinate with Person A who owns this file):

Key design: The site has public pages open to anyone and private pages requiring login. Public pages must never redirect to login.

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// These are fully public — never redirect to login
const ALWAYS_PUBLIC = ['/', '/trips', '/newsletters']
// These are for unauthenticated users only (redirect logged-in users away)
const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']
// These require login
const PROTECTED_PREFIXES = ['/dashboard', '/roster', '/photos', '/documents', '/communication', '/assistant', '/admin']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const path = nextUrl.pathname

  // Always pass public pages and API auth routes through
  if (ALWAYS_PUBLIC.some(p => path === p || path.startsWith(p + '/')) || path.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages
  if (AUTH_ONLY_PATHS.some(p => path.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users away from protected pages
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

---

## Phase 2 Tasks — Auth Pages + Role Guards

### Task 2.1 — Login Page

**`app/(auth)/login/page.tsx`:**

Build a login page that handles **both** sign-in methods. Use a tab or toggle to switch between them.

**Tab 1 — Email Login:**
- Email input
- Two sub-modes: "Send me a magic link" (passwordless, recommended) OR "Use password" toggle
- Magic link: calls `signIn('resend', { email })` and shows "Check your inbox"
- Password: calls `signIn('credentials', { email, password })`
- "Forgot password?" link

**Tab 2 — Phone Number Login:**
- Phone number input (formatted, e.g. (610) 555-1234)
- "Send Code" button → calls `POST /api/auth/phone-otp` with `action: 'send'`
- After sending, shows a 6-digit code input field
- "Verify" button → calls `POST /api/auth/phone-otp` with `action: 'verify'`
- On success → calls `signIn('credentials', { userId, authMethod: 'phone' })` with the verified userId
- Resend code button (after 60 second cooldown)

Both tabs:
- Show error states clearly (wrong code, expired, not found)
- Redirect to dashboard (or callbackUrl) on success
- Be fully responsive

**AI Prompt Tip:** Ask your AI to build the form using the existing `troop-button-primary` and `troop-card` CSS classes from `globals.css`. Frame the two methods as tabs using Radix UI Tabs component.

---

### Task 2.2 — Register Page (Invite-Only Flow)

New scouts/parents cannot self-register publicly. Registration should require an invite token:

1. Admin creates an invite link with a short-lived token
2. User clicks invite link, lands on `/register?token=xxx`
3. Registration form validates token, creates account with the pre-assigned role
4. After registration, user is logged in and redirected to dashboard

**`app/api/invite/route.ts`** — Create invite tokens:

```typescript
// POST /api/invite — admin/scoutmaster only
// Creates a signed invitation token with: email, role, expiresAt
// Returns a URL the admin can share
```

**`app/(auth)/register/page.tsx`** — Registration form:
- Validate invite token on load
- Show pre-filled email and role (read-only) from token
- Collect: name, password, phone
- On submit: create user in DB, sign them in

---

### Task 2.3 — Password Reset Flow

**`app/(auth)/forgot-password/page.tsx`:**
- Email input form
- On submit: generate reset token, send email via `lib/email.ts`

**`app/(auth)/reset-password/page.tsx`:**
- Validate token from URL
- New password form
- Update hashed password in DB

---

### Task 2.4 — Server-Side Role Guards (Helpers for Other Team Members)

Write a set of helper functions that Person F and Person E will use to protect their pages. This is different from middleware — this runs inside the page/action and can redirect with a message.

**`lib/auth-guards.ts`:**

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasMinimumRole } from '@/lib/permissions'
import type { UserRole } from '@/types'

// Call at the top of any protected server component or server action
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session
}

// Call when a minimum role is required
export async function requireRole(minimumRole: UserRole) {
  const session = await requireAuth()
  if (!hasMinimumRole(session.user.role, minimumRole)) {
    redirect('/?error=unauthorized')
  }
  return session
}

// Use in server actions to throw instead of redirect
export async function getAuthOrThrow() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}
```

Announce this file to the team when done — everyone will use it.

---

### Task 2.5 — Session Provider Wrapper

**`components/layout/session-provider.tsx`:**

```typescript
'use client'
import { SessionProvider } from 'next-auth/react'

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Add to `app/layout.tsx` root layout (coordinate with Person D who owns layout).

---

### Task 2.6 — Auth Status Component

**`components/layout/user-menu.tsx`:**

A client component showing:
- Current user name + avatar in the nav
- Role badge (e.g., "Scoutmaster", "SPL")
- Sign out button
- Link to profile settings

Person D will place this in the navigation bar.

---

## Phase 3 Tasks — Security Hardening

### Task 3.1 — Security Headers

Work with Person A to add these headers to `next.config.js`:

```javascript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]
```

---

### Task 3.2 — RBAC Audit

Go through every page and every server action in the codebase and verify:
- Every dashboard page calls `requireAuth()` or `requireRole()`
- Every server action that mutates data checks the caller's role
- No sensitive data (phone, address, medical) is returned without permission checks
- File download URLs for private documents require authentication

Create a checklist document of every protected route and check them off.

---

### Task 3.3 — Input Validation

Add Zod validation to all server actions that accept user input:

```bash
npm install zod
```

Example for sign-up form:

```typescript
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/).optional(),
})
```

---

## Coordination Notes

- **Depends on:** Person A's `types/index.ts` and Person B's `prisma/schema.prisma` (needs `passwordHash` field added to User)
- **Blocks:** Everyone — no feature page can be built without `requireAuth()` and `requireRole()` being available
- **Coordinate with Person B:** Confirm the User model has `passwordHash: String?` before Person B runs the first migration
- **Coordinate with Person D:** Session provider needs to be added to the root layout; user menu component placement in navbar
- **Coordinate with Person A:** Middleware ownership — Person A writes the file, Person C writes the logic inside it

---

## Deliverables Checklist

- [ ] `lib/auth.ts` — NextAuth v5 configuration
- [ ] `app/api/auth/[...nextauth]/route.ts` — Route handler
- [ ] `types/next-auth.d.ts` — Session type augmentation
- [ ] `middleware.ts` — Route protection (with Person A)
- [ ] `app/(auth)/login/page.tsx` — Login page
- [ ] `app/(auth)/register/page.tsx` — Invite-only registration
- [ ] `app/(auth)/forgot-password/page.tsx` — Password reset request
- [ ] `app/(auth)/reset-password/page.tsx` — Password reset form
- [ ] `app/api/invite/route.ts` — Invite token creation API
- [ ] `lib/auth-guards.ts` — `requireAuth()`, `requireRole()`, `getAuthOrThrow()`
- [ ] `components/layout/session-provider.tsx`
- [ ] `components/layout/user-menu.tsx`
- [ ] Security headers in `next.config.js`
- [ ] RBAC audit of all protected routes
- [ ] Zod validation on all mutating server actions

---

## AI Prompting Tips for Your Role

**For NextAuth v5 setup:**
> "Write a NextAuth.js v5 (Auth.js) configuration file for a Next.js 15 app router project. Use the Prisma adapter with a PostgreSQL database. Include: credentials provider with bcryptjs password comparison, optional Google OAuth provider, JWT session strategy, and JWT/session callbacks that add the user's id and role to the token and session. The UserRole type is: 'admin' | 'scoutmaster' | 'spl' | 'aspl' | 'patrol_leader' | 'parent' | 'scout'."

**For middleware:**
> "Write Next.js 15 middleware using NextAuth v5's auth() function to protect all routes except /login, /register, /forgot-password, and /api/auth/*. Redirect unauthenticated users to /login with a callbackUrl parameter. Redirect already-authenticated users away from auth pages back to /."

**For auth guards:**
> "Write TypeScript helper functions for server-side auth guards in a Next.js 15 server component context. Include: requireAuth() that calls Next.js redirect('/login') if no session exists, requireRole(minimumRole) that redirects to '/?error=unauthorized' if the user's role is below the minimum, and getAuthOrThrow() that throws instead of redirecting (for use in server actions)."

**For invite system:**
> "Write a Next.js API route that creates invite tokens for new users. The token should be a JWT signed with NEXTAUTH_SECRET containing: email, role, and expiresAt (24 hours). The endpoint should require admin or scoutmaster authentication. Return a URL that includes the token as a query parameter pointing to /register."
