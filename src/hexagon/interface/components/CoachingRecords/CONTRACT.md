# CoachingRecords — Shared Contextual Contract

Authoritative contract for extracting WeeksRecords `*View` / `New*View` components into `src/hexagon/interface/components/CoachingRecords/` and reusing them from Coaching Dashboard Recent Records.

**Do not implement components from this file alone without reading sibling hexagon `BOUNDARIES.md` files.** Interface “one use-case hook per component” is intentionally waived here (transitional: direct query/mutation hooks, matching existing WeeksRecords forms). Flag that waiver at PR time; do not invent a new use-case layer for this refactor.

---

## 1. Shape compatibility

### Source of truth

On `lcs-shared` branch `recent-records`, `RecentRecords` is defined as:

```ts
{
  privateCalls: BasePrivateCall[];
  groupCalls: BaseGroupSession[];
  assignments: BaseAssignment[];
}
```

(`src/domain/coach/recent-records.ts` — arrays of the same Zod schemas as `Base*`.)

**Conclusion: RecentRecords items are structurally identical to `BaseAssignment` / `BasePrivateCall` / `BaseGroupSession`.**

- Form props may type records as `Base*`.
- Mutation responses (`Base*`) may be written into recent-records cache arrays **without a transform**.
- **Task 2 domain transforms are not required** unless a future shared release changes the schema.

### Field notes (Base*)

| Type               | Id field         | Week linkage             | Nested coach               | Notes                                                                                                             |
| ------------------ | ---------------- | ------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `BaseAssignment`   | `assignmentId`   | `weekId` (required)      | `homeworkCorrector: Coach` | No date field; month scope is indirect                                                                            |
| `BasePrivateCall`  | `callId`         | `weekId` (nullable)      | `caller: Coach`            | `callDate`; `callType` required on `recent-records` branch, **nullable on shared `main` / current local staging** |
| `BaseGroupSession` | `groupSessionId` | via `attendees[].weekId` | `coach: Coach`             | `callDate`; attendees include `studentFullName`                                                                   |

### Shared package resolution risk

Frontend currently imports `RecentRecords` / `recentRecordsSchema` / `getRecentRecordsEndpoint` from `@learncraft-spanish/shared`, but the linked `.local-shared-staging` (and published 0.20.x without the branch) may **not** export them yet. Agents must treat `lcs-shared` `recent-records` as the intended contract and ensure the linked/published shared used for CI includes that export before merge.

---

## 2. Prop contracts

Shared export types: `./types.ts` (`CoachingRecordDisplayContext`).

### Edit views

| Component          | Record prop                      | Display / other props                                                                                                        |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `AssignmentView`   | `assignment: BaseAssignment`     | `displayContext?: CoachingRecordDisplayContext`; `tableEditMode: boolean`; `onSuccess?: () => void`                          |
| `PrivateCallView`  | `call: BasePrivateCall`          | `displayContext?: CoachingRecordDisplayContext`; `tableEditMode: boolean`; `onSuccess?: () => void`                          |
| `GroupSessionView` | `groupSession: BaseGroupSession` | **No week / displayContext** (already portable; names live on attendees); `tableEditMode: boolean`; `onSuccess?: () => void` |

**Rules:**

- **Do not** take `week: FurnishedWeekWithCoach` on edit views.
- Use `displayContext?.studentName` (fallback `"No Student"`) wherever WeeksRecords currently uses `week.student?.fullName`.
- WeeksRecords callers pass `{ studentName: week.student?.fullName }`.
- Dashboard Recent Records callers may omit `displayContext` (rows have `weekId` only, no student name) unless a later task enriches the list.

### Create views

| Component             | Inputs                                                     | Student / week selection                                                |
| --------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `NewAssignmentView`   | `weekStartsDefaultValue: string`; `onSuccess?: () => void` | Built-in week-starts dropdown + `CustomStudentSelector` (unchanged)     |
| `NewGroupSessionView` | `weekStartsDefaultValue: string`; `onSuccess?: () => void` | Date-derived week starts + attendee `CustomStudentSelector` (unchanged) |
| `NewPrivateCallView`  | **Dual path** (see below); `onSuccess?: () => void`        | Align with assignment/group                                             |

**`NewPrivateCallView` create-path decision:**

1. **Week-provided (WeeksRecords cell):**  
   `week: { weekId: number; studentName?: string; weekStarts?: string | Date }`  
   (minimal slice — not full `FurnishedWeekWithCoach`). Student is fixed; no selector. Contextual key remains `addPrivateCall{weekId}`.

2. **Selector path (Dashboard / portable):**  
   `weekStartsDefaultValue: string` and **no** `week`. Same pattern as `NewAssignmentView`: week-starts control + `CustomStudentSelector` → resolve `weekId` before create. Contextual key: `newPrivateCall`.

Exactly one of `week` or `weekStartsDefaultValue` must be provided (TypeScript discriminated union preferred).

Dashboard “New” buttons seed `weekStartsDefaultValue` from the active month (e.g. first day of selected `YYYY-MM`) or “today’s” week-start — implementers pick a consistent helper; do not require a full week row.

---

## 3. Contextual key patterns

Reuse existing WeeksRecords keys so open/close behavior stays consistent:

| Action                           | Key                                        |
| -------------------------------- | ------------------------------------------ |
| Edit assignment                  | `assignment{assignmentId}`                 |
| Edit private call                | `call{callId}`                             |
| Edit group session               | `groupSession{groupSessionId}week{weekId}` |
| Create assignment                | `newAssignment`                            |
| Create group session             | `newGroupSession`                          |
| Create private call (week known) | `addPrivateCall{weekId}`                   |
| Create private call (dashboard)  | `newPrivateCall`                           |

**Dashboard group-session edit:** RecentRecords has no row-level week. Use the first attendee’s `weekId` for the key suffix (same as create-success navigation in `NewGroupSessionView`). If there are no attendees, use `groupSession{groupSessionId}week0` or skip opening until attendees exist — prefer first attendee when present.

After successful create, open the corresponding edit key with the new record id (existing WeeksRecords behavior).

---

## 4. Cache strategy (mutations)

Query key prefix: `RECENT_RECORDS_QUERY_KEY` = `['recent-records']` (see `useRecentRecordsQuery`). Full keys: `['recent-records', coachId, monthYear]` where `monthYear` is `YYYY-MM`.

Keep existing optimistic patches for `['weeklyRecords', 'weeksByStartDate']`.

### Update / delete

- **Optimistic `setQueriesData`** on all queries matching `RECENT_RECORDS_QUERY_KEY` prefix.
- Match by id (`assignmentId` / `callId` / `groupSessionId`); replace or remove the item in the appropriate array (`assignments` / `privateCalls` / `groupCalls`).
- No shape transform: mutation `Base*` result is the cache item.
- Also invalidate membership-weeks / admin report keys as specified in Task 3 plan.

### Create

Prefer **insert-when-month-matches**, else **invalidate**:

| Record        | Month match rule                                 | On match                                                  | Else                                                        |
| ------------- | ------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------- |
| Private call  | `callDate` → `YYYY-MM` equals cached `monthYear` | Prepend/append into that cache’s `privateCalls`           | `invalidateQueries({ queryKey: RECENT_RECORDS_QUERY_KEY })` |
| Group session | `callDate` → `YYYY-MM` equals cached `monthYear` | Insert into `groupCalls`                                  | Invalidate prefix                                           |
| Assignment    | **No date on `BaseAssignment`**                  | Do **not** guess month from `weekId` in the mutation hook | **Always invalidate** recent-records prefix on create       |

Do not insert a create into a month cache that does not match; stale lists are worse than a refetch.

Coach scoping: recent-records caches are per `coachId`. If the created record’s coach/caller/corrector is not the cached coach, prefer invalidate (or skip insert) rather than showing another coach’s record.

---

## 5. Import strategy (FormComponents / CustomStudentSelector)

| Dependency                                                                                                                       | Strategy                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dropdown`                                                                                                                       | Prefer `@interface/components/FormComponents` (already hexagon)                                                                                                                                                                                     |
| `CoachDropdown`, `DateInput`, `DeleteRecord`, `FormControls`, `LinkInput`, `TextAreaInput`, `verifyRequiredInputs`, `isValidUrl` | **Transitional legacy import** from `src/components/FormComponents` (and `.../functions/inputValidation`). Do **not** relocate the whole FormComponents kit in this refactor.                                                                       |
| `CustomStudentSelector`                                                                                                          | **Transitional legacy import** from `src/components/Coaching/general/CustomStudentSelector` (named hexagon-backed export, not `*_LEGACY`). Do **not** move the selector into `CoachingRecords` in this pass unless a follow-up task owns that move. |
| `ContextualView` / `useContextualMenu` / `useModal`                                                                              | Hexagon interface hooks/components (existing paths).                                                                                                                                                                                                |
| **Styles** (`coaching.scss`)                                                                                                     | Contextual form layout (`.lineWrapper`, `.label`, `.content`, attendees, etc.) lives in `src/components/Coaching/coaching.scss`. The CoachingRecords barrel side-effect-imports it; Recent Records also imports it for page-level sort controls.    |

Rationale: hexagon `FormComponents` only exports Dropdown/TextInput today; moving every coaching form primitive is out of scope. Documented transitional imports keep a single extraction folder without a large FormComponents migration.

---

## 6. Risks

1. **Shared package not published / staging incomplete** — `RecentRecords` + endpoint may be missing from the resolved package; CI/typecheck can fail until shared is installed from the branch that exports them.
2. **`callType` nullability drift** — `main` shared: `callType` nullable; `recent-records` branch: required. Dashboard row already does `privateCall.callType.callType` without null guard. Forms must follow the schema of the **linked** shared; add null-safe UI if nullable.
3. **No student name on RecentRecords** — edit headings may show `"No Student"` unless callers supply `displayContext`.
4. **Assignment create month** — cannot optimistic-insert into the correct month without week metadata; always invalidate recent-records on assignment create.
5. **API / contract naming** — legacy API helper still returns `groupSessions` in places; shared contract uses `groupCalls`. Ensure the endpoint the frontend parses matches `recentRecordsSchema` (`groupCalls`).
6. **Month format** — UI uses `YYYY-MM`; some legacy API docs/controllers expect `MM-YYYY`. Confirm the live recent-records endpoint accepts what `useRecentRecordsQuery` sends.
7. **Boundary waiver** — extracted views will call multiple application query/mutation hooks; this violates strict interface BOUNDARIES “one hook” — accepted for this refactor, must be called out in PR.
8. **Group session contextual week suffix** — dashboard must synthesize `weekId` from attendees; key collisions across weeks of the same session are intentional (same as WeeksRecords).

---

## 7. Downstream task checklist

- **Task 2:** Skip transforms; optionally add a tiny pure helper for `date → YYYY-MM` month matching used by Task 3 (domain), not a Base*↔RecentRecords mapper.
- **Task 3:** Patch recent-records per §4; keep weeksByStartDate patches; invalidate dependents.
- **Task 4:** Extract six views under this folder; apply prop contracts; implement `NewPrivateCallView` dual path.
- **Task 5–6:** Rewire cells + dashboard keys per §3.
