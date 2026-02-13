# Person F — Core Features (Roster, Trips, Documents, Communication)

**Role:** Scout Roster Module, Trips + Permission Slips Module, Document Vault Module, Communication Center Module
**Phase Ownership:** Phase 2 feature development across 4 modules, Phase 3 integration with real data

---

## Your Job in One Sentence

You own the four core operational modules of the troop portal — the features that scouts, parents, and leaders will use every single day — making sure they work correctly, respect privacy rules, and feel polished.

---

## Phase 1 Tasks (Prep Work — Do While Waiting for Phase 1 Foundation)

### Task 1.1 — Study the Existing Modules Thoroughly

Read these files from the existing MVP before writing anything new:
- `app/roster/page.tsx` — Note every privacy masking behavior, search/filter options, role differences
- `app/trips/page.tsx` — Note the permission slip flow, trip details drawer, attendee tracking
- `app/documents/page.tsx` — Note the drag-and-drop upload, status workflow, expiration dates
- `app/communication/page.tsx` — Note the emergency alert mode, recipient targeting, channel selection
- `data/mock-db.ts` — Understand all the data shapes
- `lib/store.ts` — Understand the existing permission functions

Make a checklist of every feature in each module before you start coding.

---

## Phase 2 Tasks — Scout Roster Module

### Task 2.1 — Roster Page (Server Component)

**`app/(dashboard)/roster/page.tsx`:**

```typescript
import { requireRole } from '@/lib/auth-guards'
import { getRoster } from '@/app/actions/roster'
import { RosterTable } from '@/components/roster/roster-table'
import { RosterFilters } from '@/components/roster/roster-filters'
import { PageHeader } from '@/components/ui/page-header'

export default async function RosterPage({
  searchParams,
}: {
  searchParams: { search?: string; patrol?: string }
}) {
  // Only scoutmaster, admin, spl, aspl, patrol_leader can access this page
  const session = await requireRole('patrol_leader')
  const scouts = await getRoster()

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Scout Roster"
        subtitle={`${scouts.length} active members`}
        action={/* Add Scout button (admin/scoutmaster only) */}
      />
      <RosterFilters />
      <RosterTable scouts={scouts} currentUser={session.user} />
    </div>
  )
}
```

**Components to build:**

**`components/roster/roster-table.tsx`** — The main roster display:
- Table or card grid layout
- Columns: Name, Rank, Patrol, Phone (masked based on role), Medical Status
- Eagle Scout badge for qualifying scouts
- Sort by: name, rank, patrol
- Search by name
- Filter by patrol
- Privacy masking applied (phone shows `•••-••••` unless permitted)
- Edit button per row (scoutmaster/admin only)

**`components/roster/scout-card.tsx`** — Individual scout display card:
- Name, rank badge, patrol indicator
- Contact info (masked per role)
- Medical status indicator (colored dot, admin/scoutmaster only)
- Eagle date if applicable

**`components/roster/roster-filters.tsx`** — Filter/search bar:
- Text search input
- Patrol filter dropdown (populated from DB)
- Rank filter dropdown
- Client component that filters the displayed list

**`components/roster/edit-scout-modal.tsx`** — Edit dialog (admin/scoutmaster only):
- Edit all scout fields
- Calls `updateScout()` server action
- Only renders for admin/scoutmaster roles

**`components/roster/add-scout-modal.tsx`** — Add new scout (admin/scoutmaster only):
- Form: name, email, role, rank, patrol, phone, address
- On submit: creates user via server action, sends invite email

---

## Phase 2 Tasks — Trips Module

### Task 2.2 — Trips Page (Server Component)

**`app/(dashboard)/trips/page.tsx`:**

```typescript
import { requireAuth } from '@/lib/auth-guards'
import { getTrips } from '@/app/actions/trips'
import { TripsList } from '@/components/trips/trips-list'
import { PageHeader } from '@/components/ui/page-header'

export default async function TripsPage() {
  const session = await requireAuth()
  const trips = await getTrips()

  const upcoming = trips.filter(t => t.status === 'upcoming')
  const past = trips.filter(t => t.status === 'completed')

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Scout Adventures" />
      <TripsList upcoming={upcoming} past={past} currentUser={session.user} />
    </div>
  )
}
```

**`app/(dashboard)/trips/[id]/page.tsx`** — Trip detail page:
- Full trip details
- Attendee list
- Permission slip status for current user
- Sign permission slip (if not yet signed)
- Attendee management (scoutmaster/admin)

**Components to build:**

**`components/trips/trips-list.tsx`** — Tabbed list (Upcoming / Past):
- Tab switching
- Trip cards in a responsive grid
- Each card has: image, name, destination, dates, cost, spots remaining

**`components/trips/trip-card.tsx`** — Trip card:
- Cover image
- Trip name + destination
- Date range
- Cost badge
- Status indicator
- "View Details" button
- Permission slip status indicator for current user (signed/pending/not required)

**`components/trips/trip-detail-sheet.tsx`** — Slide-out drawer (port from MVP):
- Full trip info
- Requirements list
- Attendee count
- Sign permission slip button
- For scoutmaster: list of who has/hasn't signed

**`components/trips/permission-slip-form.tsx`** — Permission slip signing:
- Trip name and details summary
- Digital signature canvas (port `components/signature-canvas.tsx` from MVP)
- Parent/guardian name input
- Emergency contact
- Medical notes field
- Submit button
- After signing: confirmation and status update

**`components/trips/attendee-list.tsx`** — For scoutmaster view:
- List of signed up attendees
- Permission slip status for each (signed ✓ / not signed ✗)
- Capacity indicator
- Export list (optional)

**`components/trips/create-trip-modal.tsx`** — Create/edit trip (scoutmaster/admin):
- Form: name, destination, start date, end date, cost, max participants, description
- Requirements (add/remove list)
- Image upload
- Calls `createTrip()` or `updateTrip()` server action

---

## Phase 2 Tasks — Document Vault Module

### Task 2.3 — Documents Page (Server Component)

**`app/(dashboard)/documents/page.tsx`:**

```typescript
import { requireAuth } from '@/lib/auth-guards'
import { getDocuments } from '@/app/actions/documents'
import { DocumentsList } from '@/components/documents/documents-list'
import { DocumentUpload } from '@/components/documents/document-upload'
import { PageHeader } from '@/components/ui/page-header'
import { canApproveDocuments } from '@/lib/permissions'

export default async function DocumentsPage() {
  const session = await requireAuth()
  const documents = await getDocuments()
  const canApprove = canApproveDocuments(session.user.role)

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Document Vault"
        action={<DocumentUpload />}
      />
      <DocumentsList documents={documents} canApprove={canApprove} />
    </div>
  )
}
```

**Components to build:**

**`components/documents/documents-list.tsx`** — Filterable document table:
- Filter by type: Medical, Permission Slip, Waiver, Policy
- Filter by status: Pending, Approved, Rejected
- Sort by date, name, expiration
- Per row: name, type badge, uploaded by, date, status badge, expiration, actions

**`components/documents/document-card.tsx`** — Document row or card:
- Document icon by type
- Name and type
- Upload date
- Status badge (color-coded: yellow=pending, green=approved, red=rejected)
- Expiration date (red if within 30 days or expired)
- Download button
- Approve/Reject buttons (scoutmaster/admin only)

**`components/documents/document-upload.tsx`** — Upload modal:
- Drag and drop zone (large drop target)
- Preview filename and size
- Document type selector (Medical Form, Waiver, etc.)
- Associated trip selector (optional)
- Upload progress bar
- Calls `POST /api/upload` then `uploadDocument()` server action

**`components/documents/approve-reject-modal.tsx`** — Approval workflow:
- Shows document details
- Approve button → immediately updates status
- Reject button → requires a reason field
- For rejected docs: reason is stored and shown to the uploader

---

## Phase 2 Tasks — Communication Center Module

### Task 2.4 — Communication Page (Server Component)

**`app/(dashboard)/communication/page.tsx`:**

```typescript
import { requireRole } from '@/lib/auth-guards'
import { getMessages } from '@/app/actions/communication'
import { MessageComposer } from '@/components/communication/message-composer'
import { MessageHistory } from '@/components/communication/message-history'
import { PageHeader } from '@/components/ui/page-header'

export default async function CommunicationPage() {
  // Only scoutmaster, admin, and SPL can access this page
  const session = await requireRole('spl')
  const messages = await getMessages()

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Communication Center"
        subtitle="Send announcements to scouts and parents"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MessageComposer currentUser={session.user} />
        </div>
        <div>
          <MessageHistory messages={messages} />
        </div>
      </div>
    </div>
  )
}
```

**Components to build:**

**`components/communication/message-composer.tsx`** — Message creation form (client component):

This is a complex form. Port it carefully from the MVP:
- Title input
- Message body textarea
- **Recipient selector:** All Scouts, All Parents, All Leadership, By Patrol (multi-select)
- **Channel selector:** Email, SMS, In-App (multi-select checkboxes)
- **Emergency toggle:** Red highlighted background when active, confirmation dialog required
- Preview mode: Shows how the message will appear
- Send button: Shows recipient count before sending

Emergency mode behavior (important):
```typescript
// When isEmergency is toggled on:
// 1. The entire form card turns red/alarming
// 2. A confirmation dialog must be clicked before sending
// 3. Message is sent to ALL channels regardless of selection
// 4. Show a clear warning: "This will immediately send to all members via all channels"
```

**`components/communication/message-history.tsx`** — Sent messages log:
- List of sent messages, newest first
- Each entry: title, date, recipient count, channels used
- Emergency messages highlighted in red
- Click to expand full message
- Read receipt count (X/Y read)

**`components/communication/recipient-selector.tsx`** — Target audience picker:
- Buttons: All Scouts, All Parents, All Leadership, Specific Patrol
- Multi-select patrols from DB
- Shows total recipient count live as selections change

**`components/communication/channel-selector.tsx`** — Delivery channel picker:
- Checkboxes: Email, SMS, Push Notification
- Shows estimated delivery info per channel
- Emergency mode forces all channels

---

## Phase 3 Tasks (Integration + Wiring)

### Task 3.1 — Roster Privacy Integration

Verify that privacy masking from `lib/permissions.ts` is applied correctly in every roster display scenario:
- Patrol leader can see their patrol's contact info, not other patrols
- Parent can see their own scout's info but not others' details
- Scout can see basic roster info (name, rank, patrol) but no contact details
- Test with Person C to verify role gates work correctly

### Task 3.2 — Permission Slip End-to-End Test

Walk through the full flow:
1. Parent logs in → sees trip → clicks "Sign Permission Slip"
2. Signs the canvas → submits
3. Scoutmaster logs in → sees the trip → sees green check for that scout
4. Verify signature data is stored correctly in DB

### Task 3.3 — Document Expiration Alerts

Add logic to flag documents expiring within 30 days:
- Show warning badge on the document card
- Add a dashboard notification (coordinate with Person D for the notification component)
- Optional: trigger email reminder via `lib/email.ts`

### Task 3.4 — Communication Real Sending

After Person B wires up `lib/email.ts` and `lib/sms.ts`:
- Verify the `sendBlast()` server action actually triggers emails and SMS
- Test with a real email address
- Confirm emergency blast triggers all channels

---

## Phase 2 Tasks — Admin Management Panel (New Module)

This is one of the most important new features. It is specifically designed for **non-technical adult leaders** who need to manage the troop without any coding knowledge. Every task should feel like filling out a simple form.

### Task 2.5 — Admin Dashboard (Pending Tasks View)

**`app/(dashboard)/admin/page.tsx`:**

```typescript
import { requireRole } from '@/lib/auth-guards'
import { getPendingTasks } from '@/app/actions/admin'

export default async function AdminPage() {
  await requireRole('scoutmaster')
  const tasks = await getPendingTasks()

  return (
    // "Good morning, [Name]. Here's what needs your attention today."
    // Pending task cards — each clickable, goes to the relevant section
  )
}
```

The pending tasks dashboard shows cards for things like:
- "3 permission slips unsigned for [Trip Name]" → links to trips page
- "2 documents waiting for approval" → links to documents page
- "1 medical form expiring in 12 days" → links to documents page
- "4 scouts have not logged in recently" → links to user management

**Design principle:** Make it impossible to miss something important. No adult leader should ever have to go hunting for what needs to be done.

---

### Task 2.6 — User Management Page

**`app/(dashboard)/admin/users/page.tsx`:**

A simple table of all members — built for non-technical management:

Features:
- See all members: name, role, email/phone, last login date
- Change a member's role via a dropdown (no coding, just select new role and save)
- Deactivate an account (with confirmation) — removes access without deleting history
- Send a new invite link (shows a copyable URL)
- Filter by role
- Search by name
- Shows who has never logged in (recent invites that haven't been accepted)

---

### Task 2.7 — Content Editor Page

**`app/(dashboard)/admin/content/page.tsx`:**

Lets the scoutmaster update site text without touching code. Uses the `SiteContent` model from Person B.

Content blocks that can be edited:
- `troop_description` — The about/description text shown on the public landing page
- `meeting_time` — When meetings happen (e.g., "Every Tuesday at 7:00 PM")
- `meeting_location` — Address shown on public page and home dashboard
- `contact_email` — Public contact email
- `welcome_message` — The message shown to members on their dashboard
- `scoutmaster_name` — Who to contact

Each content block is an editable text area. Save changes with one click. No file editing, no deployment needed.

**`components/admin/content-editor.tsx`** — The inline edit interface:
- Display current text in a readable format
- Click "Edit" to reveal a textarea pre-filled with current content
- Save / Cancel buttons
- Shows last-updated timestamp and who changed it

---

### Task 2.8 — Site Settings Page

**`app/(dashboard)/admin/settings/page.tsx`:**

Simple settings form for global site configuration:
- Troop number (78)
- Troop name ("Willistown Scout Troop 78")
- Location city/state ("Malvern, PA")
- Year established (1978)
- Public contact email
- Emergency contact phone
- Social media links (if any)

"Save Settings" button saves everything at once. Clear confirmation message on success.

---

## Coordination Notes

- **Depends on:** Person A (`types/index.ts`, `lib/permissions.ts`), Person B (all server actions including `admin.ts`), Person C (`requireAuth`, `requireRole`), Person D (layout shell, `PageHeader`, `EmptyState`, `Badge` components)
- **Blocks:** Nobody else depends on your modules (you're the last in the dependency chain for features)
- **Coordinate with Person B:** The roster server action `getRoster()` and all server actions in `app/actions/` are Person B's responsibility — work with them early to agree on return shapes before building the UI. The `getPendingTasks()` and admin actions are also Person B's.
- **Coordinate with Person C:** The communication page has the strictest role requirement (only spl+) — verify `requireRole('spl')` works as expected
- **Coordinate with Person D:** The signature canvas component needs to be ported from the MVP — confirm with Person D if it belongs in `components/ui/` (shared) or `components/trips/` (your area). Recommend: `components/trips/signature-canvas.tsx`

---

## Deliverables Checklist

**Roster:**
- [ ] `app/(dashboard)/roster/page.tsx`
- [ ] `components/roster/roster-table.tsx`
- [ ] `components/roster/scout-card.tsx`
- [ ] `components/roster/roster-filters.tsx`
- [ ] `components/roster/edit-scout-modal.tsx`
- [ ] `components/roster/add-scout-modal.tsx`

**Trips:**
- [ ] `app/(dashboard)/trips/page.tsx`
- [ ] `app/(dashboard)/trips/[id]/page.tsx`
- [ ] `components/trips/trips-list.tsx`
- [ ] `components/trips/trip-card.tsx`
- [ ] `components/trips/trip-detail-sheet.tsx`
- [ ] `components/trips/permission-slip-form.tsx`
- [ ] `components/trips/attendee-list.tsx`
- [ ] `components/trips/create-trip-modal.tsx`

**Documents:**
- [ ] `app/(dashboard)/documents/page.tsx`
- [ ] `components/documents/documents-list.tsx`
- [ ] `components/documents/document-card.tsx`
- [ ] `components/documents/document-upload.tsx`
- [ ] `components/documents/approve-reject-modal.tsx`

**Communication:**
- [ ] `app/(dashboard)/communication/page.tsx`
- [ ] `components/communication/message-composer.tsx`
- [ ] `components/communication/message-history.tsx`
- [ ] `components/communication/recipient-selector.tsx`
- [ ] `components/communication/channel-selector.tsx`

**Integration:**
- [ ] Roster privacy masking verified for all roles
- [ ] Permission slip flow tested end to end
- [ ] Document expiration alerts working
- [ ] Communication real delivery tested

**Admin Management Panel:**
- [ ] `app/(dashboard)/admin/page.tsx` — Pending tasks dashboard
- [ ] `app/(dashboard)/admin/users/page.tsx` — User management
- [ ] `app/(dashboard)/admin/content/page.tsx` — Content editor
- [ ] `app/(dashboard)/admin/settings/page.tsx` — Site settings
- [ ] `components/admin/content-editor.tsx`

---

## AI Prompting Tips for Your Role

**For the roster table:**
> "Write a Next.js 15 React client component for a scout roster table. It receives scouts (array of User objects: [paste User type]) and currentUser (the logged-in user). Display a table with columns: Name, Rank, Patrol, Phone, Medical Status. Apply privacy masking: if currentUser.role is 'scout' or 'parent', show phone as '•••-••••' and hide medical status. If role is 'patrol_leader', show phone only for scouts in the same patrol. Use canViewPhoneNumber and canViewMedicalStatus from '@/lib/permissions'. Include a search input that filters by name and a patrol filter dropdown. Use Tailwind CSS and Framer Motion for row stagger animation."

**For the permission slip form:**
> "Write a React client component for a digital permission slip signing form. It receives a trip object (name, dates, cost, requirements array) and a userId. The form should have: a read-only trip summary section, a digital signature canvas (using react-signature-canvas), parent/guardian name input, emergency contact input, and a submit button. On submit, call the signPermissionSlip server action with (tripId, signatureData). Show a success state after signing. Use Tailwind CSS and shadcn Dialog to wrap the form."

**For the message composer (emergency mode):**
> "Write a React client component for a blast message composer for a scout troop app. It should have: title input, message textarea, recipient multi-select (All Scouts, All Parents, All Leadership, by patrol), channel checkboxes (Email, SMS, Push), and an emergency mode toggle. When emergency mode is on: add a red border and red background tint to the entire card, show a warning text, and require a confirmation dialog before the send button works. The send button shows 'Send to N recipients'. Use useState for all form state. On submit, call the sendBlast server action. Use Tailwind CSS."

**For the document upload:**
> "Write a React client component for a drag-and-drop document upload form. It should have a large dashed drop zone that accepts PDF and image files, show the file name and size after selection, a document type select dropdown (Medical Form, Permission Slip, Waiver, Policy), an optional trip association select, and an upload button. On upload, show a progress bar by tracking fetch progress. On success, call router.refresh() to update the document list. Use Tailwind CSS and the shadcn Dialog component to wrap it in a modal triggered by an 'Upload Document' button."
