# Troop 78 Website Rebuild — Full Feature Review

**For:** Troop leadership review
**Purpose:** Confirm everything planned matches what the troop needs before the team starts building

---

## What We Are Building

A website for Troop 78 (Willistown, Malvern PA) that has two parts:

1. **A public side** — Anyone on the internet can see general troop information, upcoming trips, newsletters, and photos without needing an account. This is like a front door that anyone can visit.

2. **A private member portal** — Once you log in, you get access to your personal information, can sign permission slips, upload documents, and see sensitive troop data. The private side is where all the important management happens.

The goal is to replace paper processes, scattered emails, and manual tracking with one organized place the whole troop uses — and to make it simple enough that any adult leader can manage it with no technical knowledge.

---

## Who Can Log In and What They Can Do

| Role | Who This Is | Access Level |
|---|---|---|
| **Admin** | Website manager | Everything — full control, including site settings |
| **Scoutmaster** | Troop leader | Everything operational |
| **SPL** | Senior Patrol Leader | Roster, messaging, trip management |
| **ASPL** | Assistant SPL | Similar to SPL, slightly less access |
| **Patrol Leader** | Patrol leader | Their patrol's info, trips, basic features |
| **Parent** | Scout's parent/guardian | Sign permission slips, upload medical forms, view trips |
| **Scout** | Active troop member | View trips, photos, newsletters, personal info |

New accounts are **invite-only** — the scoutmaster or admin generates an invite link and sends it to the person. Nobody can sign up on their own without an invite. This keeps the private portal troop-members-only.

---

## How People Log In

Members can sign in using **either** of the following:

- **Email address** — Enter your email, get a magic login link sent to you (no password to remember), OR use a password if you prefer
- **Phone number** — Enter your phone number, get a one-time 6-digit code sent via text message, enter the code to sign in

This means parents and scouts who aren't comfortable with passwords can just use their phone number to log in with a text message code. No one needs to remember anything.

---

## Public Pages (No Login Needed)

These pages are visible to anyone, including people who are not troop members:

### Public Home / Landing Page
What the troop looks like to the outside world:
- Troop name, location, and founding year
- Brief description of the troop
- Meeting time and location
- Links to view upcoming trips and newsletters
- A "Member Login" button

### Public Trips Page
- A list of upcoming trips (name, destination, dates)
- No cost info, no attendee list, no sign-up forms — just general information
- Encourages visitors to log in or contact the troop for more details

### Public Newsletter Archive
- All past newsletters viewable without an account
- The keyword search still works
- PDFs can be opened and downloaded by anyone

---

## Private Pages (Login Required)

### 1. Member Home Dashboard
The first thing you see after logging in.

- **Troop stats** — Active scout count, Eagle Scout count, photos archived, upcoming trip count
- **Your to-do list** — Personalized reminders (e.g., "You haven't signed the permission slip for Summer Camp" or "Your medical form expires in 14 days")
- **Memory of the Day** — A random photo from the archive shown each day
- **Upcoming trips** — The next 3 trips with dates and your permission slip status
- **Recent announcements** — Latest messages from leadership
- **AI Assistant** — A chat box where you can ask questions (see below)
- **Quick action buttons** — Shortcuts based on your role

---

### 2. Scout Roster
A directory of all troop members. **Login required.**

**Who can see it:** Scoutmaster, Admin, SPL, ASPL, Patrol Leaders (not viewable by scouts or parents)

**What it shows:**
- Every scout's name, rank, and patrol
- Eagle Scout badge for qualifying scouts
- Phone number and address (privacy rules apply — see below)
- Medical form status: Complete, Pending, or Missing

**Privacy rules:**
- Scoutmaster and Admin see everything — full contact info for everyone
- SPL and ASPL see all phone numbers but not addresses
- Patrol Leaders see phone numbers only for scouts in their own patrol
- Medical status is visible only to Scoutmaster and Admin

**Features:**
- Search by name
- Filter by patrol or rank
- Click a scout to view their full profile
- Edit a scout's info (Scoutmaster/Admin only)
- Add a new scout (Scoutmaster/Admin only) — sends them an invite link

---

### 3. Scout Adventures (Trips)
Full trip management. **Login required for sign-ups and permission slips.**

**What it shows:**
- All upcoming and past trips with full details (same as public page, but with more info)
- How many spots are left
- Your permission slip status
- Cost details

**Features:**
- Sign a digital permission slip with a signature drawn on the screen
- Scoutmaster/Admin see who has and hasn't signed for each trip
- Scoutmaster/Admin can create or edit trips using a simple form — no coding required
- Gear/requirements checklist per trip
- Attendee list for leaders

---

### 4. Photo Archive
The troop's full photo collection with AI-powered search and tagging. **Login required.**

**What it shows:**
- All troop photos organized by event
- AI-generated tags on each photo (e.g., "camping," "campfire," "Eagle ceremony")
- Whether tags have been verified by a leader or are still AI suggestions
- Faces identified with scout names (leaders only)

**Features:**
- Search photos by keyword, event, or person's name
- Click a photo to see it full size
- Scoutmaster/Admin can verify AI tags or add manual tags
- Batch drag-and-drop upload (AI automatically tags new photos)
- **Synology NAS Sync** (Admin/Scoutmaster only) — Syncs photos from the troop's Synology home server directly into the archive

---

### 5. Document Vault
Secure storage for all troop paperwork. **Login required.**

**Document types:**
- Medical forms (Annual Health and Medical Record)
- Permission slips
- Liability waivers
- Troop policies

**Features:**
- Parents and scouts upload their own documents (drag-and-drop)
- Scoutmaster/Admin approves or rejects with a reason
- Status badges: Pending (yellow), Approved (green), Rejected (red)
- Expiration warnings when a document is within 30 days of expiring
- Documents linked to specific trips

---

### 6. Communication Center
Send announcements to the whole troop. **Login required. Sending is Scoutmaster/Admin/SPL only.**

**What it does:**
- Send a message to everyone, all parents, all leadership, or a specific patrol
- Deliver via Email, Text Message, or both
- **Emergency Alert Mode** — turns red, requires confirmation, blasts everyone on all channels immediately. For weather cancellations, urgent safety notices, etc.
- Full message history with read receipts

---

### 7. AI Assistant
A chat interface powered by AI that any logged-in member can use. **Login required.**

**What it can answer:**
- "What trips are coming up and what do I need to bring?"
- "What are the requirements for the Camping merit badge?"
- "When is the next troop meeting?"
- "How do I submit my medical form?"
- "Who is the SPL this year?"
- General scouting questions based on BSA guidelines

**What it knows:**
- Everything currently on the website (trips, upcoming events, troop info)
- BSA merit badge requirements and general scouting knowledge
- Troop-specific information added by the admin

**What it cannot do:**
- It does not have access to private personal information (addresses, medical records)
- It cannot send messages or make changes on your behalf
- It is not a replacement for contacting the scoutmaster directly

The AI assistant appears as a chat bubble in the corner of every page so it's always accessible.

---

### 8. Admin Management Panel
A dedicated area for non-technical adults to manage the website. **Admin/Scoutmaster only.**

This is specifically designed so that **no coding knowledge is required** to run the site day to day.

**What you can do here:**
- **Pending tasks dashboard** — See everything that needs your attention (unsigned permission slips, pending documents to approve, unanswered questions from the AI, etc.) in one place
- **Content manager** — Add or edit text on pages (troop description, meeting times, contact info) by clicking directly on the text and typing
- **Announcement builder** — Create announcements using templates (Meeting Reminder, Trip Announcement, Event Cancelled, Emergency Alert)
- **User management** — See all members, change someone's role, deactivate an account, send new invites
- **Trip wizard** — A step-by-step form that walks you through creating a new trip (no fields to figure out — it asks you one thing at a time)
- **Document approval queue** — One-click approve or reject on all pending documents
- **Site settings** — Change the troop name, meeting location, contact email, social links

---

## Accounts and Login Summary

- **Login options:** Email (magic link or password) OR phone number (text message code)
- **Invite-only signup** — Admin/Scoutmaster generates a link with a role pre-assigned. Link expires in 24 hours.
- **No password required** — Members can always log in via their phone number if they forget their password
- **Account settings** — Members can update their own name, phone number, and email

---

## Privacy and Security Summary

- **Public pages** are visible to anyone on the internet — no personal info is shown
- **Private pages** require a login — sensitive info is never on the public side
- Phone numbers, addresses, and medical status are hidden from roles that don't need them
- Documents and photos are stored securely — they require a login to access
- No sensitive data is ever publicly visible

---

## Easy Management Summary

The site is built with non-technical adult leaders in mind:

- Every management task has a visual interface — no typing commands or editing files
- The admin panel shows a "today's tasks" view so nothing falls through the cracks
- Templates handle the most common tasks (announcements, trip creation) so leaders don't start from scratch
- The AI assistant can help leaders find information or figure out what to do next
- Permission slips, document approvals, and roster updates all happen in a few clicks

---

## What the Team Is Building (Simple Tech Summary)

- **Real database** — All data stored in a real database. Nothing is fake or hard-coded.
- **Real file storage** — Photos, documents, and PDFs stored in secure cloud storage.
- **Real authentication** — Login via email or phone number with industry-standard security.
- **Real email and SMS** — Announcements and login codes sent via real email and text message.
- **Real AI** — Photo tagging, newsletter text extraction, and the AI assistant all use OpenAI's GPT-4o (the same model as ChatGPT).
- **Deployed on Vercel** — Live on the internet, automatically updated when the team makes changes.

---

## What Is NOT Being Built (Out of Scope for Now)

- A mobile app (the site works great on phones, but it is not a downloadable app)
- Integration with BSA's Scoutbook system
- Online payment for trip fees
- A public forum or discussion board
- A merit badge tracker
- A calendar that syncs with Google/Apple Calendar

These could all be added in a future phase.

---

## Questions to Confirm

Please review and answer these before the team starts building:

1. Is the split between public pages and private pages correct? (Public: landing, trips list, newsletters. Private: everything else)
2. Is phone number login (text message code) the right approach, or should everyone just use email?
3. Are the privacy rules for phone/address/medical status correct for your troop?
4. Is invite-only membership the right call, or should there be a way for new families to request access?
5. Are there document types missing from the vault? (Medical, Permission Slip, Waiver, Policy — anything else?)
6. Does the AI assistant description match what you'd want it to do?
7. Is the Admin Management Panel list complete, or are there other day-to-day tasks you do manually that should be in there?
8. Is there anything the troop currently does on paper or by email that is not covered anywhere in this plan?
