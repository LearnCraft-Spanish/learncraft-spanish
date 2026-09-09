# Offline PWA — Phase 1 Plan

_What we need to reach phase 1 offline access. Not an implementation guide — a checklist of gaps, requirements, and staged delivery._

**Phase 1 goal:** A student can install or reopen the app without a network connection, quiz their **collected flashcards** (text), take an **SRS quiz** with those flashcards, and have review results **upload the next time they are online**.

**Primary surface:** `/myflashcards` (Review My Flashcards) — text quiz + SRS mode. Audio offline is explicitly later unless called out as optional.

Related product context: [`DOMAIN_GLOSSARY.md`](./DOMAIN_GLOSSARY.md) (flashcards, SRS, quiz types). Architecture: [`../src/hexagon/ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md).

---

## Phase 1 in / out of scope

### In scope

- Installable / home-screen capable PWA basics (manifest, icons, display mode)
- Offline app shell sufficient to open and run Review My Flashcards
- Durable local copy of the student’s collected flashcards (and minimal identity/role data needed to run the quiz)
- Offline **text** quiz of collected flashcards
- Offline **SRS** quiz (due cards only), with locally correct due-state after reviews
- Queue review outcomes while offline; upload when connectivity returns
- Clear UX for offline / pending sync (student knows whether reviews are saved locally vs synced)

### Out of scope (later phases)

- Offline audio quiz (S3 MP3 prefetch / cache packs)
- Offline custom quizzes, official quizzes, limited quizzes, flashcard finder/manager mutations
- Offline coaching / admin surfaces
- Push notifications
- Full offline catalog / course browsing
- Multi-device conflict UI beyond a simple, documented sync rule

---

## Current state: what we already have

These reduce phase 1 risk; stages should build on them rather than replace them.

| Area | Today |
| ---- | ----- |
| Review My Flashcards | `/myflashcards` supports collected-card text quiz, SRS toggle (due cards), and audio quiz (online) |
| SRS result model | Reviews are easy / hard / viewed → flashcard interval updates (not a separate “quiz result” record for this surface) |
| Pending review queue | `srs-pending-updates` in `localStorage`; batch flush to API; restore on failure |
| Flush on return | `useFlushFlashcardUpdatesOnLoad` retries pending updates after flashcards load |
| Domain SRS | Client computes new interval at flush time (`calculateNewSrsInterval`) |
| Icons / chrome hints | `logo192` / `logo512`, `theme-color`, apple-touch-icon in `index.html` |
| Hosting | Netlify SPA fallback; long-cache hashed `/assets/*`; `index.html` no-cache |
| Hexagon seams | Ports for HTTP, Auth0, localStorage — room for IndexedDB / cache ports without smearing IO into domain |

---

## Current state: what is missing

### A. Installable PWA surface

| Missing | Why it matters |
| ------- | -------------- |
| Web app manifest (`manifest.webmanifest` or equivalent) | Name, icons, `start_url`, `display`, theme — required for install / home screen |
| Manifest linked from `index.html` | Browser discovery of installability |
| Maskable / sized icons wired through the manifest | Reliable install icons across Android / desktop |
| Service worker | Without it, there is no offline shell and limited “installed app” behavior |
| Install / Add to Home Screen guidance (esp. iOS) | iOS does not use the same install prompt as Chromium |
| Offline / sync status in the UI | Students need to know when they are offline and when reviews are waiting to upload |

### B. Offline runtime (app can open and run)

| Missing | Why it matters |
| ------- | -------------- |
| Precached app shell (HTML + JS/CSS chunks for `/myflashcards` and shared vendors) | Cold open with no network must not white-screen |
| Strategy for Vite code-splitting / chunk updates offline | Avoid infinite reload loops when a chunk is missing offline |
| Self-hosted or SW-cached fonts | Google Fonts CDN fails offline today |
| Gate that does not hard-require live Auth0 + API on every cold start | `/myflashcards` is auth-gated; memory-only Auth0 session dies on restart |

### C. Offline study data

| Missing | Why it matters |
| ------- | -------------- |
| Durable flashcard snapshot (beyond React Query memory) | Query cache is lost on reload; offline restart has no cards |
| Durable minimal student / role snapshot | SRS access and flush rules depend on own-user student role |
| Decision on filters offline (lesson / skill-tag deps) | Full filter panel needs course/lesson/tag data; phase 1 may simplify |
| Optimistic local application of reviews to intervals / `nextReview` | Without this, due lists stay stale across offline sessions until sync |
| Stronger pending-update identity (full timestamps vs date-only) | Same-day / multi-session sync correctness; code already notes a TODO |

### D. Sync when back online

| Missing | Why it matters |
| ------- | -------------- |
| Explicit reconnect flush (e.g. `online` / visibility), not only quiz end + next full load | Student may reconnect without remounting the quiz |
| Pending-count / failed-sync UX | Invisible queue erodes trust |
| Documented conflict / idempotency rules with API | Retries and multi-device reviews must not corrupt intervals |
| Confirmation that batch `updateMyFlashcards` is the phase 1 upload contract | Align frontend + `lcs-api` before building more surface area |

### E. Auth / security for offline

| Missing | Why it matters |
| ------- | -------------- |
| Auth0 session strategy for reopen offline (`cacheLocation`, refresh tokens, or offline-unlocked mode) | Largest product/security decision in phase 1 |
| Rules for when local flashcard data may be read without a live token | Privacy on shared devices; logout must clear local study data |
| No silent API calls while offline that clear the pending queue | Flush must only clear after successful upload |

### F. Explicitly not required for phase 1 text/SRS

| Missing | Defer unless product insists |
| ------- | ---------------------------- |
| Offline audio asset cache (S3 MP3s) | Storage, CORS, quota — follow-on stage |
| Background Sync / Periodic Sync APIs | Nice-to-have; `online` + load flush is enough for v1 |
| Offline Finder / Manager / add-remove flashcards | Mutations and catalog are out of phase 1 |

---

## What phase 1 needs (capability checklist)

Capabilities the product must have when phase 1 is “done,” independent of how we implement them:

1. **Installable** — Student can add the app to home screen / install on supported browsers with correct name and icons.
2. **Reopen offline** — After at least one successful online session that prepared offline data, student can open the app with no network and reach Review My Flashcards.
3. **Quiz collected cards offline** — Text quiz over owned flashcards works without API or CDN (except what was already cached).
4. **SRS quiz offline** — Due-only mode works from local data; completing reviews updates local due state for the rest of the offline session (and later sessions before sync).
5. **Queue reviews offline** — Outcomes survive app close / browser restart.
6. **Upload on reconnect** — When online again (same session or later), pending reviews upload via the existing flashcard update API; failures leave the queue intact.
7. **Honest UI** — Offline mode and pending sync are visible; failures are recoverable without data loss.
8. **Safe logout / device share** — Clearing session clears or locks local flashcard + pending data per agreed policy.

---

## Stages of implementation

Order matters: each stage should be shippable or demoable on its own where possible. Do not start audio offline until text/SRS sync is trustworthy.

### Stage 0 — PWA installability (no offline study yet)

**Outcome:** App is a proper installable PWA online.

- Add web app manifest (name, short_name, icons, `start_url`, `display`, theme/background colors)
- Wire manifest + any missing icon sizes / purpose (`any` / `maskable`)
- Register a minimal service worker (even if it only claims clients / caches the shell lightly)
- Document or ship basic install guidance (Android/desktop vs iOS Add to Home Screen)
- Verify Netlify headers still allow correct SW + `index.html` update behavior

**Exit criteria:** Lighthouse / browser installability checks pass on staging; installed app opens to the live site online.

---

### Stage 1 — Offline app shell

**Outcome:** Installed or revisited app can load UI chrome and the Review My Flashcards route without network (may still show “no data” / “go online once”).

- Precache shell assets and critical route chunks for `/myflashcards`
- Handle offline navigation for that route (and a small set of shared dependencies)
- Cache or self-host fonts used by the quiz UI
- Define update strategy: how new deploys replace the shell when the student is back online
- Offline fallback page when a non-cached route is requested

**Exit criteria:** Airplane mode after one online visit shows app UI (not a browser network error page) for the phase 1 route.

---

### Stage 2 — Durable flashcard snapshot

**Outcome:** Flashcards (and minimal user context) survive reload offline.

- Persist student’s collected flashcards after a successful online fetch
- Persist minimal identity/role fields needed for SRS access and flush rules
- Decide phase 1 filter scope: full filters (also persist course/lesson/tag deps) **or** simplified offline setup (no lesson/tag filters)
- Load from local store when network/API unavailable; prefer server data when online
- Clear or seal local data on logout per policy

**Exit criteria:** Kill network, hard-refresh, still see owned flashcards on `/myflashcards` setup (or an explicit “last synced at …” empty state if never prepared).

---

### Stage 3 — Auth / session for offline reopen

**Outcome:** Cold start offline does not falsely treat the student as logged out when local study data is allowed.

- Choose and document Auth0 approach (persistent cache + refresh **or** offline-unlocked local mode)
- Align route gates and loading states with “offline but prepared” vs “never logged in”
- Ensure token refresh / API use only happens when online
- Coordinate any Auth0 tenant settings (refresh token rotation, etc.) if that path is chosen

**Exit criteria:** After preparing offline data, fully quit browser, go offline, reopen app, reach quiz setup as the same student without a live login round-trip.

_Note: This stage can overlap Stage 2 design, but should not ship Stage 4 until auth behavior is decided._

---

### Stage 4 — Offline text + SRS quiz behavior

**Outcome:** Student can complete collected-card and SRS text quizzes entirely offline.

- Run text quiz from local flashcard snapshot (no live `getMyFlashcards` required mid-quiz)
- SRS due filtering from local `nextReview` / interval fields
- Apply reviews optimistically to the local snapshot so subsequent offline quizzes see updated due sets
- Keep using (and if needed, extend) the pending-update queue for outcomes
- Disable or hide online-only actions (add/remove cards, audio mode, filters that need missing data)

**Exit criteria:** Full collected-card text quiz and SRS text quiz completable in airplane mode with correct local progress.

---

### Stage 5 — Sync on reconnect

**Outcome:** Pending reviews upload reliably when the student returns online.

- Flush on reconnect / visibility, in addition to quiz end and next load
- Never drop pending items on failed upload
- Surface pending count and sync success/failure
- Confirm API contract with `lcs-api`: batch update payload, idempotency, conflict rule when server `lastReviewed` is newer
- Resolve date-only vs datetime for pending records if required for correctness
- Manual and automated test plan: offline reviews → online flush → server intervals match expectations

**Exit criteria:** Offline session → close app → later online open (or reconnect) uploads all pending reviews; server state matches; queue empty; second flush is a no-op.

---

### Stage 6 — Phase 1 polish and guardrails

**Outcome:** Phase 1 is supportable in production for a limited rollout.

- Feature flag or cohort gate for offline PWA if needed
- Telemetry / Sentry breadcrumbs for SW install, cache miss, sync failure (no PII in payloads)
- QA matrix: Chromium Android, desktop Chrome/Edge, iOS Safari (install + offline limits documented)
- Support copy: “prepare offline” (open app online once), what works offline, what does not (audio, other quiz types)
- Explicit “not yet” for audio offline unless a thin spike is approved

**Exit criteria:** Staging sign-off on the phase 1 goal statement; known iOS/Safari limitations documented; rollback path clear (disable flag / unregister SW policy).

---

## Optional follow-on (not phase 1)

Keep listed so it does not sneak into phase 1 scope:

- **Offline audio quiz** — Prefetch/cache example MP3s from S3; quota UI; “download for offline” control
- Background Sync for flush when the tab is closed
- Offline flashcard collection management
- Broader offline surfaces (home, progress, official quizzes)

---

## Cross-cutting decisions to resolve early

Resolve these before or during Stages 2–3; they unblock design without requiring full implementation:

1. **Auth model offline** — Persistent Auth0 session vs offline-unlocked local vault after one online login.
2. **Filter scope offline** — Full filters (more data to persist) vs quiz-options-only (SRS / custom / length / start-with-Spanish).
3. **Sync ownership** — Client keeps computing intervals at flush time vs API accepts difficulty events (affects `lcs-api` / shared package).
4. **Conflict rule** — Last-write-wins by timestamp, “server wins if already reviewed that day,” or reject-and-keep-pending.
5. **Logout / shared device** — Always wipe local flashcards + pending queue on logout.
6. **Preparation ritual** — Is “open app once online” enough, or do we need an explicit “Ready for offline” control that confirms snapshot + shell cache?

Backend work (if any) lives in **`lcs-api`** / **`lcs-shared`**; this repo owns shell, local persistence, quiz UX, and client-side queue behavior.

---

## Suggested delivery order (summary)

```
Stage 0  Installable PWA
   ↓
Stage 1  Offline app shell
   ↓
Stage 2  Durable flashcard snapshot  ←→  Stage 3  Auth/session offline
   ↓
Stage 4  Offline text + SRS quiz
   ↓
Stage 5  Sync on reconnect
   ↓
Stage 6  Polish, flag, QA, docs
```

Phase 1 is complete when Stages 0–6 exit criteria are met for **text collected-card quiz + SRS quiz + deferred upload**, on at least one primary browser platform, with iOS limitations explicitly documented.
