# Weekly Records Interface Refactor

This document tracks the incremental refactor of the Weekly Records Interface from legacy coaching code into the hexagon. The current goal is to make the interface technically accessible again while keeping broken legacy data and CRUD flows disabled.

## Current State

- The `/weeklyrecords` route is available as a hexagon interface page.
- The first migrated read route uses `getWeeksByStartDateEndpoint` to load furnished weekly records for one start date.
- The legacy implementation remains in `src/components/Coaching/WeeksRecords`.
- Legacy data orchestration remains in `src/hooks/CoachingData`.
- Core weekly-record GET functions in `src/hooks/CoachingData/queries/StudentRecordsBackendFunctions.tsx` currently throw `This feature is not available at this time.`
- Legacy create, update, and delete flows still reference old coaching endpoints and must not be exposed until each workflow is migrated.

## Legacy Implementation Map

- `src/components/Coaching/WeeksRecords/WeeksRecords.tsx` owns the old page shell, filters, table orchestration, and contextual creation entry points.
- `src/components/Coaching/WeeksRecords/Table/WeeksTable.tsx` owns pagination, table edit mode, and bulk week updates.
- `src/components/Coaching/WeeksRecords/Table/WeeksTableItem.tsx` owns row rendering and single week updates.
- `src/components/Coaching/WeeksRecords/Table/AssignmentsCell.tsx` owns assignment display plus assignment create, update, and delete flows.
- `src/components/Coaching/WeeksRecords/Table/PrivateCallsCell.tsx` owns private call display plus private call create, update, and delete flows.
- `src/components/Coaching/WeeksRecords/Table/GroupSessionsCell.tsx` owns group session display plus group session, attendee, and topic-option mutations.
- `src/components/Coaching/WeeksRecords/ViewWeekRecord.tsx` owns the old student/week contextual detail view.
- `src/hooks/CoachingData/useCoaching.ts` composes the legacy coaching queries, mutations, and lookup helpers.

## Disabled Legacy Surfaces

Do not expose these until their data contracts and behavior have been rebuilt inside `src/hexagon/`:

- Loading weekly records through the legacy `useCoaching` page path.
- Bulk week edit mode and `coaching/update-many-weeks`.
- Single week updates through `coaching/weeks`.
- Assignment create/update/delete through `coaching/assignments`.
- Private call create/update/delete through `coaching/private-calls`.
- Group session create/update/delete through `coaching/group-sessions`.
- Group attendee create/delete through `coaching/group-attendees`.
- Group session topic option creation through `coaching/group-sessions/topic-field-options`.

## Migration Guidelines For AI Agents

- Read nearby documentation and the relevant `BOUNDARIES.md` files before editing.
- Build all new weekly records behavior inside `src/hexagon/`.
- Preserve un-migrated legacy features. Do not blank-delete old data paths or UI capabilities just because they are not working.
- If a new hexagon route or feature fully replaces a legacy implementation, the replaced legacy code can be removed in the same change.
- If a feature has not been migrated yet, keep it disabled or commented out with a short migration note.
- Interface pages should call at most one application use-case hook.
- Application hooks must use explicit return types.
- Infrastructure must use shared endpoint contracts when they exist. Do not hardcode new API paths in infrastructure.

## Suggested Migration Order

1. Define weekly-record domain/application types and the port required by the frontend.
2. Implement read-only infrastructure and query hooks for weekly records.
3. Build a read-only page use case and replace the shell content with migrated data display.
4. Migrate filters and sorting into application/domain functions with tests.
5. Re-enable detail views as read-only migrated components.
6. Migrate one CRUD workflow at a time, starting with the smallest workflow and adding focused tests.

## Current Shell Contract

The shell page is intentionally read-only:

- It does not import `useCoaching`.
- It does not call legacy query hooks.
- It does not expose edit, create, update, or delete controls.
- It calls `getWeeksByStartDateEndpoint` through the hexagon port, infrastructure, query, and page use case.
- It exists so coaches/admins can access the route and verify the first furnished weekly records data route while the replacement is built incrementally.
