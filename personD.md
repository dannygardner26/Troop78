# Person D — UI Foundation + Design System

**Role:** Design System, Base Components, Navigation, Layout Shell, Dashboard Home, Responsive Framework
**Phase Ownership:** Phase 1 design foundation, Phase 2 layout + home page, Phase 3 polish pass across all modules

---

## Your Job in One Sentence

You build the visual skeleton that every other team member's features plug into — the layout shell, the navigation, the shared component library, and the home dashboard — making sure everything looks cohesive and matches the troop's maroon and gold branding.

---

## Phase 1 Tasks (Complete Before Phase 2 — Everyone Needs Base Components)

### Task 1.1 — Set Up shadcn/ui

The project uses Radix UI primitives. Formalize this into shadcn/ui for consistency:

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral (you'll override with troop colors)
- CSS variables: Yes

Then add the components the app needs:

```bash
npx shadcn@latest add button card dialog dropdown-menu select progress separator toast badge sheet input label textarea
```

---

### Task 1.2 — Port Tailwind Config with Troop Branding

The existing `tailwind.config.ts` has the troop's color palette. Port it exactly:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Troop 78 brand colors
        troop: {
          maroon: '#800000',
          gold: '#FFD700',
          'maroon-dark': '#600000',
          'maroon-light': '#A00000',
          'gold-dark': '#D4AF00',
          'slate-900': '#0f172a',
          'slate-800': '#1e293b',
          'slate-700': '#334155',
        },
        // shadcn/ui CSS variable overrides
        primary: {
          DEFAULT: '#800000',
          foreground: '#ffffff',
        },
        // Keep the full red/primary scale for compatibility
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          // ... full scale
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        terminal: 'terminal 1s steps(1) infinite',
        in: 'fadeIn 0.2s ease-out',
        out: 'fadeOut 0.2s ease-in',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        terminal: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

### Task 1.3 — Port Global CSS

**`app/globals.css`** — Port the existing utility classes:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .troop-card {
    @apply bg-white border border-gray-200 rounded-xl shadow-sm;
  }

  .troop-button-primary {
    @apply bg-troop-maroon text-white font-medium px-4 py-2 rounded-lg
           hover:bg-troop-maroon-dark transition-colors duration-200
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .hero-maroon {
    background-color: #800000;
  }

  .maroon-pin {
    /* Custom map pin shape — keep exactly from original */
    clip-path: polygon(50% 0%, 100% 35%, 100% 75%, 50% 100%, 0% 75%, 0% 35%);
    background-color: #800000;
  }

  /* Terminal UI for Synology sync */
  .terminal-bg {
    @apply bg-gray-950 text-green-400 font-mono text-sm;
  }

  .terminal-cursor::after {
    content: '_';
    animation: terminal 1s steps(1) infinite;
  }
}
```

---

### Task 1.4 — Write Core Shared Components

These components will be used by everyone. Write them before Phase 2 begins and announce when ready.

**`components/ui/page-header.tsx`**
```typescript
// A consistent page title + subtitle + optional action button
// Used at the top of every feature page
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}
```

**`components/ui/empty-state.tsx`**
```typescript
// Shown when a list has no items
// Takes: icon, title, description, optional action button
```

**`components/ui/loading-spinner.tsx`**
```typescript
// Centered spinner with optional label
// Used in Suspense fallbacks
```

**`components/ui/role-badge.tsx`**
```typescript
// Colored badge showing a user's role
// admin → red, scoutmaster → maroon, spl → gold, etc.
```

**`components/ui/stat-card.tsx`**
```typescript
// The dashboard stat cards (scouts: 32, eagle scouts: 8, etc.)
// Takes: label, value, icon, optional trend
```

---

## Phase 2 Tasks — Layout Shell + Dashboard

### Task 2.1 — Public Layout (New)

**`app/(public)/layout.tsx`:**

The public-facing layout. Anyone on the internet sees this. It should look professional and welcoming.

```typescript
import { PublicNavigation } from '@/components/layout/public-navigation'
import { PublicFooter } from '@/components/layout/public-footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavigation />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
```

**`components/layout/public-navigation.tsx`:**
- Troop 78 logo/name on the left
- Links: Home, Trips, Newsletters
- "Member Login" button on the right (links to `/login`)
- If somehow a logged-in user is on a public page, show "Go to Dashboard" instead

**`components/layout/public-footer.tsx`:**
- Troop 78, Malvern PA, Est. 1978
- Meeting location
- Contact email
- Simple maroon footer

**`app/(public)/page.tsx`:** — Public landing page:
- Hero section with troop name, tagline, meeting location
- "Upcoming Adventures" — public trip cards (no sign-up, no cost info)
- "Our Newsletter" — link to newsletter archive
- "Member Login" CTA

---

### Task 2.2 — Root Layout

**`app/layout.tsx`:**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppSessionProvider } from '@/components/layout/session-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Troop 78 — Willistown Scout Troop',
  description: 'Scout management portal for Troop 78, Malvern PA. Est. 1978.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppSessionProvider>
          {children}
        </AppSessionProvider>
      </body>
    </html>
  )
}
```

---

### Task 2.2 — Auth Layout

**`app/(auth)/layout.tsx`:**

A centered, minimal layout for login/register pages:
- Full-page maroon background (`hero-maroon`)
- Centered white card
- Troop 78 logo/wordmark at top
- No navigation

---

### Task 2.3 — Dashboard Layout

**`app/(dashboard)/layout.tsx`:**

The wrapper for all protected pages. Includes:
- Navigation sidebar/header
- Page content area
- Role-based conditional elements

```typescript
import { requireAuth } from '@/lib/auth-guards'
import { Navigation } from '@/components/layout/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()  // Server-side auth guard

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={session.user} />
      <main className="pt-16">  {/* Offset for fixed nav height */}
        {children}
      </main>
    </div>
  )
}
```

---

### Task 2.4 — Navigation Component

**`components/layout/navigation.tsx`:**

Port the existing navigation from the MVP with real auth integration:

Features:
- Troop 78 logo on the left (maroon background, white text)
- Nav links: Home, Roster, Trips, Photos, Documents, Communication, Newsletters, AI Assistant
- Links that are hidden based on user role (e.g., Communication hidden for `scout`)
- User menu (from Person C) on the right showing name + avatar
- **AI chat bubble** — A floating button in the bottom-right corner of every dashboard page that opens the AI assistant chat (see Task 2.8)
- Mobile hamburger menu with slide-out drawer
- Active link highlighting
- `CMD/CTRL + K` opens the global search modal

```typescript
'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { canSendBlast } from '@/lib/permissions'
// ...
```

Role-gated nav items:
- **Roster:** visible to scoutmaster, admin, spl, aspl, patrol_leader
- **Communication:** visible to scoutmaster, admin, spl
- **Documents:** visible to all (parents need to upload medical forms)
- **Photos, Trips, Newsletters:** visible to all

---

### Task 2.5 — Global Search Modal

**`components/global-search.tsx`:**

Port the existing `CMD+K` search modal to use real server actions:
- `CMD/CTRL + K` opens the modal
- Searches scouts, trips, photos in real time
- Keyboard navigation (arrow keys + enter)
- Results grouped by type with icons
- Closes on escape or click outside

This will need server actions from Person B — coordinate on the search API shape.

---

### Task 2.6 — Dashboard Home Page

**`app/(dashboard)/page.tsx`:**

Port the existing home page to use real data via server actions:

```typescript
import { requireAuth } from '@/lib/auth-guards'
import { getDashboardStats } from '@/app/actions/dashboard'

export default async function HomePage() {
  const session = await requireAuth()
  const stats = await getDashboardStats()

  return (
    // Hero section, stats, memory of the day, upcoming trips, map
  )
}
```

Sections to build:
1. **Hero** — Maroon background, "Troop 78 | Willistown, PA" title, tagline, quick action buttons (role-gated)
2. **Stats Row** — Active Scouts, Eagle Scouts, Photos Archived, Upcoming Trips
3. **Memory of the Day** — Random photo from DB with AI tags
4. **Upcoming Trips** — Next 3 trips from DB
5. **Meeting Location Map** — Static map or embed for 15 Mill Road, Malvern PA

Ask Person B to write a `getDashboardStats()` server action.

---

### Task 2.7 — Error and Not-Found Pages

Port and improve:
- **`app/error.tsx`** — Error boundary with "Something went wrong" message and retry button
- **`app/not-found.tsx`** — 404 page with troop branding and back to home link

---

### Task 2.8 — AI Assistant Chat Widget (Floating)

This is a persistent floating chat bubble that sits in the bottom-right corner of every dashboard page. It is separate from the full `/assistant` page — it's a quick-access widget.

**`components/assistant/chat-bubble.tsx`** — The floating button:
- Fixed position, bottom-right of screen
- Maroon circle with a chat/sparkle icon
- Click opens the chat panel

**`components/assistant/chat-panel.tsx`** — The slide-up chat window (client component):
- Opens as a card anchored above the bubble
- Shows the last 5 messages in the conversation
- Text input at the bottom with a send button
- Calls `POST /api/ai/assistant` (Person E's route) for responses
- "View full conversation" link to `/assistant` page
- Close button

Add the `<ChatBubble />` component to the dashboard layout in `app/(dashboard)/layout.tsx`. It should only render for authenticated users.

**AI Prompt Tip:**
> "Write a React client component for a floating AI chat widget. It should have: a fixed-position circular button in the bottom-right corner with a sparkle icon, clicking it opens a chat card panel that slides up above it, the panel shows messages in a scrollable list with user messages right-aligned (maroon) and AI messages left-aligned (gray), a text input at the bottom, and a send button. On send, call a callback prop with the message text. Show a loading indicator while awaiting response. Use Tailwind CSS and Framer Motion for the open/close animation."

---

## Phase 3 Tasks — Polish Pass

### Task 3.1 — Responsive Audit

Go through every page built by the team and verify it works at:
- 375px (iPhone SE)
- 768px (iPad)
- 1280px (laptop)
- 1920px (desktop)

Fix layout issues across all modules — you have the authority to edit any page's layout/wrapper code.

---

### Task 3.2 — Framer Motion Animations

Add consistent entrance animations across pages:
- Page headers fade in from below
- Card grids stagger in sequentially
- Dialogs and drawers use consistent enter/exit

Port the animation patterns from the existing MVP.

---

### Task 3.3 — Dark Mode (Optional / Stretch)

If time allows, implement dark mode using Tailwind's `class` strategy and a toggle in the user menu.

---

## Coordination Notes

- **Depends on:** Person A for Tailwind config, Person C for session provider and user menu component
- **Blocks:** Person F and Person E — they need the layout shell and base components to build their feature pages into
- **Coordinate with Person A:** Tailwind config is split between you and Person A — decide who writes `tailwind.config.ts` (recommend: Person A writes it based on your spec, you review)
- **Coordinate with Person C:** Session provider goes in root layout (your file), user menu component is theirs but you place it in navigation (yours)
- **Coordinate with Person B:** Global search needs a search server action — define the shape together early

---

## Deliverables Checklist

- [ ] shadcn/ui initialized and base components added
- [ ] `tailwind.config.ts` with full troop branding
- [ ] `app/globals.css` with all utility classes ported
- [ ] `components/ui/page-header.tsx`
- [ ] `components/ui/empty-state.tsx`
- [ ] `components/ui/loading-spinner.tsx`
- [ ] `components/ui/role-badge.tsx`
- [ ] `components/ui/stat-card.tsx`
- [ ] `app/layout.tsx` — Root layout with session provider
- [ ] `app/(auth)/layout.tsx` — Auth pages layout
- [ ] `app/(dashboard)/layout.tsx` — Dashboard layout with auth guard
- [ ] `components/layout/navigation.tsx` — Full navigation with role gating
- [ ] `components/global-search.tsx` — CMD+K global search
- [ ] `app/(dashboard)/page.tsx` — Dashboard home page
- [ ] `app/error.tsx` and `app/not-found.tsx`
- [ ] Responsive audit of all pages
- [ ] Framer Motion animations

---

## AI Prompting Tips for Your Role

**For the navigation component:**
> "Write a Next.js 15 'use client' navigation component for a scout troop management app. It should have: a fixed top bar with maroon (#800000) background, the troop name 'Troop 78' on the left in white, nav links in the center (Home, Roster, Trips, Photos, Documents, Communication, Newsletters), a user avatar/name on the right. Use Next.js Link and usePathname for active state. Hide the Roster link if role is 'parent' or 'scout'. Hide Communication if role is 'parent', 'scout', or 'patrol_leader'. On mobile (< 768px), show a hamburger menu that opens a slide-in drawer using Radix UI Sheet. Use Tailwind CSS. Import UserRole from '@/types'."

**For the dashboard home page:**
> "Write a Next.js 15 server component for a scout troop dashboard home page. It receives stats (activeScouts, eagleScouts, photosArchived, upcomingTrips as numbers), a randomPhoto object, and upcomingTrips array. Use a full-width maroon hero section at the top with the troop name. Below it show 4 stat cards in a responsive grid. Then show a 'Memory of the Day' section with the photo and its AI tags. Then show a list of upcoming trips. Use Tailwind CSS and Framer Motion for staggered card animations."

**For base components:**
> "Write a reusable PageHeader React component in TypeScript. It takes: title (string), subtitle (optional string), and action (optional ReactNode). Render the title in text-2xl font-bold text-gray-900, subtitle in text-gray-500, and the action aligned to the right. Add a bottom border. Export as a named export. Use Tailwind CSS."
