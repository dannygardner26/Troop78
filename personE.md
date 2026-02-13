# Person E — Media Features (Photos + Newsletters)

**Role:** Photo Archive Module, Newsletter Archive Module, File Upload Pipeline, AI Integration (photo tagging + OCR)
**Phase Ownership:** Phase 2 feature development, Phase 3 AI integration and Supabase storage wiring

---

## Your Job in One Sentence

You own the two most visually rich and technically complex modules — the photo archive with AI tagging and the newsletter archive with OCR search — plus all the underlying AI and file storage infrastructure that makes them work.

---

## Phase 1 Tasks (Prep Work — Do While Waiting for Phase 1 Foundation)

### Task 1.1 — Familiarize Yourself with the Existing Modules

Read these files from the existing MVP before writing anything new:
- `app/photos/page.tsx` — Understand every feature that needs to be replicated
- `app/newsletters/page.tsx` — Understand the OCR search and polaroid layout
- `data/mock-db.ts` — Understand the data shape for photos and newsletters
- `components/synology-sync.tsx` — Understand the terminal UI simulation

List out every feature in each module so nothing gets missed in the rebuild.

---

### Task 1.2 — Design the AI Integration Architecture

Before writing any code, plan how the AI pipeline will work:

**Photo Tagging Flow:**
1. Admin/scoutmaster uploads a photo via the UI
2. Upload goes to `POST /api/upload` (Person B's route) → stored in Supabase `photos` bucket
3. Upload API calls `POST /api/ai/tag-photo` with the photo URL
4. AI route sends image to OpenAI GPT-4o Vision
5. Tags + face context returned, saved to `PhotoTag` and `PhotoFace` tables
6. Photo appears in the gallery with AI-generated tags

**Newsletter OCR Flow:**
1. Admin uploads a newsletter PDF
2. PDF stored in Supabase `newsletters` bucket
3. Trigger `POST /api/ai/ocr-newsletter` with the PDF URL
4. OpenAI extracts text, key topics, dates
5. Extracted text saved to `Newsletter.extractedText` in DB
6. Newsletter searchable by content in the archive

Write this plan as comments at the top of your AI route files.

---

## Phase 2 Tasks — Photo Archive Module

### Task 2.1 — Photos Server Actions

Coordinate with Person B to write `app/actions/photos.ts`, or write it yourself once the schema is ready:

```typescript
'use server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guards'

export async function getPhotos(filters?: {
  event?: string
  tags?: string[]
  search?: string
  page?: number
}) {
  await requireAuth()
  // Fetch photos with their tags, paginated
  // Apply filters for event, tags, text search
}

export async function getPhotoById(id: string) {
  await requireAuth()
  return db.photo.findUnique({
    where: { id },
    include: { tags: true, faces: { include: { user: true } } },
  })
}

export async function verifyPhotoTag(photoId: string, tag: string) {
  const session = await requireRole('scoutmaster')  // Only leaders verify
  return db.photoTag.update({
    where: { photoId_tag: { photoId, tag } },
    data: { verified: true },
  })
}

export async function addManualTag(photoId: string, tag: string) {
  const session = await requireAuth()
  return db.photoTag.create({
    data: { photoId, tag, source: 'manual', verified: true },
  })
}

export async function getPhotoEvents(): Promise<string[]> {
  await requireAuth()
  const results = await db.photo.findMany({ select: { event: true }, distinct: ['event'] })
  return results.map(r => r.event)
}
```

### Task 2.2 — AI Photo Tagging Route

**`app/api/ai/tag-photo/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'
import { db } from '@/lib/db'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId, imageUrl } = await req.json()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'low' },
          },
          {
            type: 'text',
            text: `You are helping tag photos for a Boy Scout troop archive (Troop 78, Malvern PA).
Analyze this photo and return a JSON object with:
- tags: array of 5-10 descriptive tags (activities, settings, emotions, notable objects)
- event_type: what kind of scout event this appears to be
- confidence: your confidence score 0.0-1.0

Format: {"tags": [...], "event_type": "...", "confidence": 0.0}
Only return the JSON, nothing else.`,
          },
        ],
      },
    ],
    max_tokens: 200,
  })

  const content = response.choices[0].message.content || '{}'
  let parsed: { tags?: string[]; event_type?: string; confidence?: number }

  try {
    parsed = JSON.parse(content)
  } catch {
    return NextResponse.json({ error: 'AI parsing failed' }, { status: 500 })
  }

  // Save tags to DB
  const tags = parsed.tags || []
  await Promise.all(
    tags.map(tag =>
      db.photoTag.upsert({
        where: { photoId_tag: { photoId, tag } },
        create: { photoId, tag, source: 'ai', verified: false },
        update: {},
      })
    )
  )

  // Update confidence score
  await db.photo.update({
    where: { id: photoId },
    data: { confidenceScore: parsed.confidence || 0 },
  })

  return NextResponse.json({ tags, confidence: parsed.confidence })
}
```

### Task 2.3 — AI OCR Newsletter Route

**`app/api/ai/ocr-newsletter/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'
import { db } from '@/lib/db'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newsletterId, pdfUrl } = await req.json()

  // Note: GPT-4o can read PDFs via the files API or via fetched image pages
  // For simplicity, use the responses API with PDF content
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `You are processing a Boy Scout troop newsletter PDF for a searchable archive.
The PDF is at: ${pdfUrl}

Extract and return a JSON object with:
- full_text: complete text content of the newsletter
- topics: array of key topics/events mentioned
- dates_mentioned: array of dates found in the text
- excerpt: a 2-3 sentence summary

Format: {"full_text": "...", "topics": [...], "dates_mentioned": [...], "excerpt": "..."}
Only return the JSON.`,
      },
    ],
    max_tokens: 4000,
  })

  const content = response.choices[0].message.content || '{}'
  let parsed: { full_text?: string; topics?: string[]; excerpt?: string }

  try {
    parsed = JSON.parse(content)
  } catch {
    return NextResponse.json({ error: 'AI parsing failed' }, { status: 500 })
  }

  // Update newsletter with extracted text
  await db.newsletter.update({
    where: { id: newsletterId },
    data: {
      extractedText: parsed.full_text || '',
      excerpt: parsed.excerpt || '',
    },
  })

  return NextResponse.json({ success: true, topics: parsed.topics })
}
```

---

### Task 2.4 — Photo Archive Page

**`app/(dashboard)/photos/page.tsx`:**

Port the existing photos page with all its features, backed by real data:

```typescript
import { requireAuth } from '@/lib/auth-guards'
import { getPhotos, getPhotoEvents } from '@/app/actions/photos'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PhotoFilters } from '@/components/photos/photo-filters'
import { SynologySync } from '@/components/photos/synology-sync'

export default async function PhotosPage() {
  const session = await requireAuth()
  const [photos, events] = await Promise.all([getPhotos(), getPhotoEvents()])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header with photo count */}
      {/* Filter bar: search, event dropdown, tag filter */}
      {/* Photo grid with AI tags */}
      {/* Synology sync panel (admin/scoutmaster only) */}
    </div>
  )
}
```

**Components to build:**

**`components/photos/photo-grid.tsx`** — Masonry or grid layout of photos:
- Thumbnail display
- Hover reveals AI tags + confidence score
- Click opens photo detail modal
- Verified vs. unverified tag visual distinction

**`components/photos/photo-card.tsx`** — Individual photo card:
- Thumbnail image
- Event name
- Date
- Tags (max 3 shown, +N more)
- AI confidence badge

**`components/photos/photo-detail-modal.tsx`** — Full photo view in a Dialog:
- Full-size image
- All tags (AI + verified + manual)
- Face detections (if any)
- Tag verification interface (scoutmaster/admin only)
- Add manual tag input

**`components/photos/photo-filters.tsx`** — Filter bar:
- Search input
- Event dropdown
- "Show only verified" toggle
- Clear filters

**`components/photos/synology-sync.tsx`** — Port the terminal UI:
- Keep the exact terminal aesthetic from the MVP
- Wire to a real sync status API if possible, otherwise simulate with realistic data
- Only visible to admin/scoutmaster

**`components/photos/upload-photos.tsx`** — Batch photo upload:
- Drag and drop zone
- Preview before upload
- Upload progress bar
- After upload, triggers AI tagging automatically

---

## Phase 2 Tasks — Newsletter Archive Module

### Task 2.5 — Newsletters Server Actions

Write `app/actions/newsletters.ts` (or coordinate with Person B):

```typescript
'use server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guards'

export async function getNewsletters(search?: string) {
  await requireAuth()

  if (search) {
    // Full-text search on extractedText using Prisma
    return db.newsletter.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { extractedText: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: { date: 'desc' },
    })
  }

  return db.newsletter.findMany({ orderBy: { date: 'desc' } })
}

export async function uploadNewsletter(formData: FormData) {
  const session = await requireRole('scoutmaster')
  // Upload PDF to Supabase storage
  // Create Newsletter record in DB
  // Trigger OCR processing via /api/ai/ocr-newsletter
}
```

### Task 2.6 — Newsletter Archive Page

**`app/(dashboard)/newsletters/page.tsx`:**

Port the existing newsletter page with real data:

```typescript
import { requireAuth } from '@/lib/auth-guards'
import { getNewsletters } from '@/app/actions/newsletters'
import { NewsletterGrid } from '@/components/newsletters/newsletter-grid'
import { NewsletterSearch } from '@/components/newsletters/newsletter-search'

export default async function NewslettersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  await requireAuth()
  const newsletters = await getNewsletters(searchParams.q)
  // Group by year for year-based section headers

  return (
    // Search bar at top
    // Year-grouped newsletter cards
    // Polaroid card style preserved from MVP
  )
}
```

**Components to build:**

**`components/newsletters/newsletter-card.tsx`** — Polaroid-style card:
- Preserve the exact polaroid aesthetic from the MVP
- Newsletter thumbnail
- Title and date
- Click to open PDF in new tab or modal

**`components/newsletters/newsletter-search.tsx`** — Search with highlights:
- Search input with debounce
- Updates URL query param `?q=searchterm` (for server component re-render)
- Results show matched text with highlighted keywords

**`components/newsletters/newsletter-grid.tsx`** — Year-grouped grid:
- Section header for each year
- Cards in a responsive grid
- If search active, show matched excerpt with keyword highlighting

**`components/newsletters/upload-newsletter.tsx`** — Admin upload form:
- PDF file input
- Title and date fields
- Upload + trigger OCR
- Only visible to admin/scoutmaster

---

## Phase 3 Tasks (Integration + Polish)

### Task 3.1 — Wire Photo Upload to AI Tagging

After Person B's upload API is live, make sure the photo upload component:
1. Calls `POST /api/upload` with the image
2. Gets back the URL and storage key
3. Calls `POST /api/ai/tag-photo` with the photo ID and URL
4. Shows a "Processing AI tags..." indicator
5. Refreshes the photo card when tags arrive

### Task 3.2 — Wire Newsletter Upload to OCR

After upload, trigger OCR:
1. Call `POST /api/upload` with the PDF
2. Create the Newsletter DB record
3. Call `POST /api/ai/ocr-newsletter` to process
4. Show "Extracting text..." status
5. Newsletter becomes searchable once done

### Task 3.3 — Search Performance

If the newsletter text search is slow on large archives, work with Person B to add a PostgreSQL full-text search index:

```sql
-- Add to a Prisma migration
CREATE INDEX newsletter_search_idx ON "Newsletter" USING gin(to_tsvector('english', "extractedText"));
```

---

## Phase 2 Tasks — AI Assistant (New Module)

You own the AI Assistant in addition to photos and newsletters. This is a major feature.

### Task 2.7 — AI Assistant API Route

**`app/api/ai/assistant/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'
import { getAssistantContext, saveMessage, getChatHistory } from '@/app/actions/assistant'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json()

  // Get troop context and chat history to provide to the AI
  const [context, history] = await Promise.all([
    getAssistantContext(),
    getChatHistory(10),
  ])

  const systemPrompt = `You are the AI assistant for Boy Scout Troop 78 in Willistown, Malvern PA (est. 1978).
You help scouts, parents, and leaders with questions about the troop, scouting, and upcoming events.
Be friendly, helpful, and concise. Use age-appropriate language.
Never make up information — if you don't know something, say so.

Current troop context:
${context}

Important limitations:
- Do not share private personal information (addresses, medical records, phone numbers)
- You cannot send messages, sign documents, or make changes to the system
- For emergencies, always direct people to contact the scoutmaster directly`

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    // Include recent chat history for context
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: message },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 500,
  })

  const reply = response.choices[0].message.content || 'Sorry, I could not generate a response.'

  // Save both messages to DB
  await saveMessage('user', message)
  await saveMessage('assistant', reply)

  return NextResponse.json({ reply })
}
```

### Task 2.8 — AI Assistant Full Page

**`app/(dashboard)/assistant/page.tsx`:**

```typescript
import { requireAuth } from '@/lib/auth-guards'
import { getChatHistory } from '@/app/actions/assistant'
import { AssistantChat } from '@/components/assistant/assistant-chat'

export default async function AssistantPage() {
  const session = await requireAuth()
  const history = await getChatHistory(50)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask anything about Troop 78, upcoming trips, or scouting"
      />
      <AssistantChat initialHistory={history} />
    </div>
  )
}
```

**`components/assistant/assistant-chat.tsx`** — Full-page chat UI (client component):
- Full scrollable chat history
- Suggested questions at the top for new users (e.g., "What trips are coming up?", "What merit badges can I work on?", "When is the next meeting?")
- Text input at the bottom with send button
- Keyboard shortcut: Enter to send
- Loading state while AI responds (typing indicator)
- Each AI message has a "Was this helpful? 👍 👎" feedback button
- Clear conversation button

**`components/assistant/suggested-questions.tsx`** — Quick-start prompts:
```typescript
const SUGGESTED_QUESTIONS = [
  "What trips are coming up and what do I need?",
  "How do I submit my medical form?",
  "What merit badges can I work on at home?",
  "When and where does the troop meet?",
  "Who are the current troop leaders?",
]
```

---

## Coordination Notes

- **Depends on:** Person A (`types/index.ts`), Person B (DB schema + upload API + server actions + `app/actions/assistant.ts`), Person C (`requireAuth`, `requireRole`), Person D (layout shell, base components, chat bubble widget)
- **Coordinate with Person B:** The `getAssistantContext()` server action in `app/actions/assistant.ts` is Person B's responsibility — align with them on what troop context gets injected into the AI system prompt
- **Coordinate with Person D:** The floating chat bubble (`components/assistant/chat-bubble.tsx`) is Person D's responsibility. Your API route (`/api/ai/assistant`) is what the bubble calls. Make sure the request/response shape is agreed on early.
- **Coordinate with Person B:** Confirm storage bucket names (`photos`, `newsletters`, `thumbnails`) and upload API response shape before writing photo/newsletter upload components

---

## Deliverables Checklist

- [ ] `app/actions/photos.ts` — All photo server actions
- [ ] `app/actions/newsletters.ts` — All newsletter server actions
- [ ] `app/api/ai/tag-photo/route.ts` — AI photo tagging endpoint
- [ ] `app/api/ai/ocr-newsletter/route.ts` — AI OCR endpoint
- [ ] `app/(dashboard)/photos/page.tsx` — Photos page (server component)
- [ ] `components/photos/photo-grid.tsx`
- [ ] `components/photos/photo-card.tsx`
- [ ] `components/photos/photo-detail-modal.tsx`
- [ ] `components/photos/photo-filters.tsx`
- [ ] `components/photos/synology-sync.tsx`
- [ ] `components/photos/upload-photos.tsx`
- [ ] `app/(dashboard)/newsletters/page.tsx` — Newsletters page (server component)
- [ ] `components/newsletters/newsletter-card.tsx`
- [ ] `components/newsletters/newsletter-search.tsx`
- [ ] `components/newsletters/newsletter-grid.tsx`
- [ ] `components/newsletters/upload-newsletter.tsx`
- [ ] Photo upload → AI tagging pipeline wired end to end
- [ ] Newsletter upload → OCR pipeline wired end to end
- [ ] `app/api/ai/assistant/route.ts` — AI assistant chat endpoint
- [ ] `app/(dashboard)/assistant/page.tsx` — Full assistant page
- [ ] `components/assistant/assistant-chat.tsx`
- [ ] `components/assistant/suggested-questions.tsx`

---

## AI Prompting Tips for Your Role

**For the AI tagging route:**
> "Write a Next.js 15 API route (POST) that accepts a photoId and imageUrl, sends the image to OpenAI GPT-4o Vision, extracts tags and a confidence score for a Boy Scout photo archive, and saves the tags to a Prisma database using these models: [paste Photo and PhotoTag models from schema]. Return the tags and confidence score in the response. Include proper error handling. Use the openai npm package."

**For the photo grid component:**
> "Write a React client component for a photo archive grid. It receives an array of Photo objects: [paste Photo type]. Display photos in a responsive grid (2 cols on mobile, 3 on tablet, 4 on desktop) using CSS grid. Each photo card shows: a thumbnail image, the event name, the date, and up to 3 tags as small badges. Tags from source 'ai' and not verified show with a dashed border. Tags that are verified show solid. Add a hover effect that slightly scales the card. Use Tailwind CSS and Framer Motion for the hover animation. Clicking a card calls an onSelect callback."

**For the newsletter search:**
> "Write a Next.js 15 client component for a newsletter search bar. It uses useRouter and useSearchParams to update a URL query parameter 'q' as the user types (with 300ms debounce). The component should show a search icon inside the input and a clear button when there is a value. Use Tailwind CSS and the shadcn Input component."

**For the Synology terminal UI:**
> "Write a React client component that simulates a terminal interface for a Synology NAS photo sync operation. It should show: a dark (bg-gray-950 text-green-400 font-mono) terminal window with a scrollable log area, a blinking cursor, simulated log lines that appear one by one on mount (e.g., 'Connecting to NAS...', 'Authenticating...', 'Scanning /photos/2024...', 'Found 147 new files', 'Downloading batch 1/15...', etc.), a progress bar at the bottom, and Start/Stop buttons. Use useState and useEffect to simulate the async log output. Only render this component if the user's role is 'admin' or 'scoutmaster'."
