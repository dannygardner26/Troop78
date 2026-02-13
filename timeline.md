# Troop 78 Rebuild — Weekly Timeline & Deadlines

**Total Duration:** 8 weeks
**Approach:** AI-assisted development, 6 people working in parallel after Phase 1

---

## How to Read This Document

Each week lists what every person should have **finished and merged** by end of that week. If something is marked with `[BLOCKER]`, the entire team is affected if it's late — those items must be treated as the highest priority.

If you fall behind, notify the group immediately so Person A can help unblock you or redistribute work.

---

## Week 1 — Foundation (Phase 1, Part 1)
**Goal:** Get the project set up so everyone can start writing real code next week.

| Person | Due by End of Week 1 |
|---|---|
| **A** | Repo initialized with full folder structure. All dependencies installed. `.env.example` committed. CI/CD pipeline running (GitHub Actions linting + type-check on every push). Branch protection on `main` configured. `[BLOCKER]` |
| **B** | Supabase project created. All 4 storage buckets created. DB credentials ready and sent to Person A. `prisma/schema.prisma` first draft written and shared with team for review. `[BLOCKER]` |
| **C** | NextAuth v5 installed. `lib/auth.ts` written with credentials provider. Phone OTP API route skeleton created. `types/next-auth.d.ts` written. |
| **D** | shadcn/ui initialized. `tailwind.config.ts` ported with troop branding. `app/globals.css` ported. All 5 base UI components written (`page-header`, `empty-state`, `loading-spinner`, `role-badge`, `stat-card`). |
| **E** | Existing MVP photos and newsletter pages studied and features documented. AI integration architecture plan written (as comments in their API route files). No code merged yet — just prep. |
| **F** | Existing MVP roster, trips, documents, and communication pages studied and features documented. Feature checklist written. No code merged yet — just prep. |

**End of Week 1 Checkpoint:** Person A calls a group review. Schema reviewed by all 6 people. Types finalized. Nobody writes feature code until this checkpoint passes.

---

## Week 2 — Foundation (Phase 1, Part 2)
**Goal:** Auth works end-to-end. Shared foundation complete. Everyone can start Phase 2.

| Person | Due by End of Week 2 |
|---|---|
| **A** | `types/index.ts` finalized and tagged `types-v1`. `lib/permissions.ts` written and tagged `permissions-v1`. `lib/utils.ts` ported. Tailwind config reviewed and confirmed. Announces "Phase 2 go" to team. `[BLOCKER]` |
| **B** | Schema reviewed + approved by team. First migration run: `npx prisma migrate dev --name init`. `lib/db.ts` (Prisma singleton) written. `lib/supabase.ts` written. Seed script started. |
| **C** | Login page built (both tabs: email + phone). Auth working end-to-end — someone can actually log in and get a session. `lib/auth-guards.ts` written (`requireAuth`, `requireRole`, `getAuthOrThrow`). Announces to team that auth guards are ready. `[BLOCKER]` |
| **D** | Root layout, auth layout, and dashboard layout all built. Navigation component built (role gating wired). Session provider in place. Dashboard layout confirmed working with Person C's auth. `[BLOCKER for F and E]` |
| **E** | Wait for Person A's types + Person C's auth guards. Start `app/actions/photos.ts` skeleton (function signatures, no logic yet). |
| **F** | Wait for Person A's types + Person C's auth guards. Start `app/actions/` skeleton files for roster, trips, documents, communication. |

**End of Week 2 Checkpoint:** Someone can log in with email AND phone number. The dashboard layout renders. Person A confirms foundation is solid. Phase 2 officially begins.

---

## Week 3 — Feature Development (Phase 2, Part 1)
**Goal:** All 6 people building their modules simultaneously. First real features landing.

| Person | Due by End of Week 3 |
|---|---|
| **A** | `middleware.ts` protecting all dashboard routes while keeping public pages open. `next.config.js` production-ready. Responding to PRs within 24 hours. Begin `prisma/seed.ts` with Person B. |
| **B** | `app/actions/roster.ts` complete with privacy masking. `app/actions/trips.ts` complete. `lib/email.ts` (Resend) written. `lib/sms.ts` (Twilio) written. |
| **C** | Invite-only registration page complete. Password reset flow complete (forgot password + reset pages). `components/layout/user-menu.tsx` built and given to Person D. |
| **D** | Dashboard home page complete (with real data from server actions). Global search modal built. Public layout + public landing page built. |
| **E** | `app/api/ai/tag-photo/route.ts` complete. `app/actions/photos.ts` complete. Photo grid and photo card components built. |
| **F** | Roster page complete (table, search, filter, privacy masking rendering correctly). Trips list page complete. |

---

## Week 4 — Feature Development (Phase 2, Part 2)
**Goal:** All modules at 50%+ done. AI assistant starting to take shape.

| Person | Due by End of Week 4 |
|---|---|
| **A** | Seed script complete — team can run `npx prisma db seed` to get realistic test data. All PRs reviewed within 24 hours. |
| **B** | `app/actions/documents.ts` complete. `app/actions/communication.ts` complete. `app/api/upload/route.ts` complete. `app/actions/admin.ts` complete. |
| **C** | Security headers added to `next.config.js`. Zod validation added to all auth-related server actions. Full RBAC audit started. |
| **D** | Auth layout (login/register pages) styled and polished. AI assistant floating chat bubble and panel built (`components/assistant/chat-bubble.tsx`, `chat-panel.tsx`). |
| **E** | `app/api/ai/ocr-newsletter/route.ts` complete. Newsletter archive page complete. `app/api/ai/assistant/route.ts` complete. AI assistant full page built. |
| **F** | Trip detail page and permission slip form complete (with signature canvas). Document vault page complete (upload, list, status badges). |

---

## Week 5 — Feature Development (Phase 2, Part 3) + Integration Starts
**Goal:** All features functionally complete. Begin wiring everything together.

| Person | Due by End of Week 5 |
|---|---|
| **A** | Vercel project set up. Environment variables configured in Vercel. Preview deployments working for PRs. First staging URL live. |
| **B** | `app/actions/newsletters.ts` complete. `app/actions/assistant.ts` complete (`getAssistantContext`, `saveMessage`, `getChatHistory`). All server actions fully tested against seeded DB. |
| **C** | RBAC audit complete — checklist of every protected route verified. Zod validation on all mutating server actions. |
| **D** | Public trips page and public newsletter page built (for unauthenticated visitors). Full responsive check of all components built so far. |
| **E** | Photo upload → AI tagging pipeline working end to end. Newsletter upload → OCR pipeline working. AI assistant responding correctly with troop context. |
| **F** | Communication center complete (composer + history + recipient selector + emergency mode). Admin panel pages built (pending tasks, user management, content editor, settings). |

**End of Week 5 Checkpoint:** Every module has a working page. Team does a full walkthrough as each role (scout, parent, patrol leader, SPL, scoutmaster, admin). List all integration bugs found.

---

## Week 6 — Integration + Wiring (Phase 3)
**Goal:** Connect all the pieces. Real emails sending. Real SMS working. All role gates enforced.

| Person | Due by End of Week 6 |
|---|---|
| **A** | All cross-module integration issues from the Week 5 checkpoint resolved. Final middleware review. |
| **B** | Communication `sendBlast()` wired to Resend (real email delivery). Communication `sendBlast()` wired to Twilio (real SMS). Document expiration alert emails wired. |
| **C** | All login paths tested (email magic link, email+password, phone OTP). Invite flow tested end to end. Session expiry tested. |
| **D** | AI assistant chat bubble placed in dashboard layout. Navigation admin link shown/hidden by role. All animation polish applied. |
| **E** | AI assistant tested with real questions from each user role. Suggested questions updated based on real troop needs. Photo tagging confidence scores displaying correctly. |
| **F** | Permission slip full flow tested (parent signs → scoutmaster sees checkmark). Document approval/reject flow tested with real feedback emails. Admin content edits saving and reflecting on public pages. |

---

## Week 7 — QA + Polish (Phase 4, Part 1)
**Goal:** Find and fix every real-world problem before showing to the troop.

| Person | Due by End of Week 7 |
|---|---|
| **A** | Full security review: exposed routes, data leaking in API responses, file access without auth. Final PR cleanup. |
| **B** | Database performance check — queries running fast under real data load. Any slow queries optimized. Full-text search index added for newsletters. |
| **C** | Full end-to-end test of every role. Document what each role can and cannot do. Confirm it matches the plan. |
| **D** | Complete responsive audit — every page on mobile (375px), tablet (768px), laptop (1280px). Fix all layout issues. |
| **E** | AI assistant edge cases tested (bad questions, long conversations, offensive inputs — confirm it handles gracefully). |
| **F** | Admin panel tested by a non-technical person (ideally the scoutmaster). Document any confusing UX and fix it. |

---

## Week 8 — Final Polish + Launch
**Goal:** Site is ready for real use by the troop.

| Person | Due by End of Week 8 |
|---|---|
| **A** | Production deploy to final Vercel URL. DNS configured if custom domain. All env vars confirmed in production. Final sign-off. |
| **B** | Seed script run against production DB (or troop uploads real data). |
| **C** | Admin account created for the scoutmaster. Invite links generated for all current troop members. |
| **D** | Dark mode (optional stretch goal). Final visual polish pass. |
| **E** | AI assistant system prompt tuned with real troop info. |
| **F** | Short walkthrough guide written for the scoutmaster (1-pager: how to log in, add a trip, send an announcement, approve a document). |

**End of Week 8:** Site shared with troop leadership for review at the Vercel URL. Feedback collected. Bug fixes prioritized.

---

## Dependency Map (Who Waits for Who)

```
Week 1: A + B set up the foundation (everyone waits)
Week 2: C finishes auth (D, E, F wait before building feature pages)
Week 2: D finishes layout shell (E, F wait before building feature pages)
Week 3+: Everyone works in parallel

B's server actions  →  F's feature pages (roster, trips, documents, communication)
B's server actions  →  E's feature pages (photos, newsletters, assistant)
C's auth guards     →  Everyone's feature pages
D's base components →  Everyone's feature pages
E's AI assistant route → D's floating chat bubble
B's admin actions   →  F's admin panel
```

---

## Weekly Sync Rhythm

- **Daily:** Brief async update in Discord/Slack — "what I'm working on, any blockers"
- **End of each week:** All completed work merged to `main`. Person A does a quick review.
- **Checkpoints (Weeks 1, 2, 5):** Full team sync call. Review what's built, identify cross-module issues.
- **Week 7:** Non-technical review with the actual scoutmaster if possible.
- **Week 8:** Live demo to troop leadership.

---

## What To Do If You Are Stuck

1. Try asking your AI tool with better context (paste the types, schema, and permissions files)
2. Post in the team channel — someone may have already solved a similar problem
3. Tag Person A in your PR or message for help with infrastructure/types
4. Tag Person C for help with auth or permission issues
5. Tag Person B for help with database queries or server actions
6. Do not stay stuck for more than a day before asking for help
