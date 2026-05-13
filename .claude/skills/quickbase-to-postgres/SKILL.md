---
name: quickbase-to-postgres
description: Migrates one database table at a time from the legacy QuickBase-backed code outside hexagon into the hexagonal architecture using shared domain types and route contracts from @learncraft-spanish/shared. Use when the user or a parent agent says "migrate [table] table", "move [table] into hexagon", or "quickbase to postgres migration for [table]". Handles ambiguous table names that exist in both vocabQuizDb and studentRecordsDb by asking for clarification.
disable-model-invocation: true
---

# QuickBase → Postgres Migration Skill

Migrates one table's data access from legacy `src/hooks/` into `src/hexagon/`, using domain types and route contracts from `@learncraft-spanish/shared`. Interface concerns (UI components) are **out of scope** for this skill — only data paths and domain types.

This skill runs as a sub-task of a parent migration agent. The parent agent drives sequencing; this skill reports findings and executes the hexagon build.

---

## Step 0: Resolve the Table Target

Before doing anything else, determine the exact table to migrate.

1. Check the specified table name against [TABLES.md](TABLES.md).
2. If the table name exists in **both** `vocabQuizDb` and `studentRecordsDb` (currently: **`lessons`**), and the database was not specified, **stop and ask**:

   > "The `lessons` table exists in both `vocabQuizDb` and `studentRecordsDb`. Which database should I migrate from?"

3. Do not proceed until you have an unambiguous `(tableName, database)` pair.

---

## Phase 1: Audit — Find the Legacy Code

Search for all legacy data access outside `src/hexagon/` for the target table.

### What to search for

| Location to check               | What to look for                                 |
| ------------------------------- | ------------------------------------------------ |
| `src/hooks/VocabQuizDbData/`    | Hooks that fetch/mutate the table                |
| `src/hooks/StudentRecordsData/` | Same for StudentRecords tables                   |
| `src/hooks/CoachingData/`       | Any queries for this table                       |
| `src/hooks/AdminData/`          | Same                                             |
| `src/components/`               | Any direct API calls or component-level fetches  |
| `src/types/`                    | Legacy type definitions for this table's records |

### What constitutes a legacy data concern

- Calls to `getFactory`, `newPostFactory`, `newPutFactory` (from `useBackendHelpers` / `useBackend.ts`)
- Hardcoded API path strings like `'vocab-quiz/students'`
- Legacy type imports from `src/types/DatabaseTables`, `src/types/interfaceDefinitions`, or `src/components/DatabaseTables/*/types`
- Any `useQuery` / `useMutation` outside `src/hexagon/application/queries/`
- Toast calls mixed into data hooks (`toast.promise(...)`)

### Report to parent agent

Produce a concise audit report:

```
## Audit: [tableName] ([database])

### Legacy files found
- src/hooks/VocabQuizDbData/useStudentsTable.ts — fetches + mutates students; uses FlashcardStudent type (legacy)
- src/hooks/VocabQuizDbData/queries/BackendFunctions.ts — getStudentsTable(), getStudentsTableCohortFieldOptions()

### Hardcoded API paths
- GET  vocab-quiz/students
- POST vocab-quiz/students
- PUT  vocab-quiz/students

### Legacy types used
- FlashcardStudent (src/types/interfaceDefinitions)
- EditableStudent, NewStudent (src/components/DatabaseTables/VocabQuizDb/StudentsTable/types)

### Shared package status
- @learncraft-spanish/shared currently at: [version from package.json]
- Domain types needed in shared (cross-cutting, used by both frontend & backend): [list]
- Frontend-only domain types (SPA concerns — will live in src/hexagon/domain/): [list]
- Route contracts needed in shared: getStudents, createStudent, updateStudent endpoints

### Legacy interface consumers
- [List every file in src/sections/, src/components/, src/functions/, src/types/ that imports the legacy types above — these will need updating when types change]
```

**Stop here.** Hand the audit report to the parent agent. The parent agent / human will decide which types belong in `@learncraft-spanish/shared` vs `src/hexagon/domain/`, define the route contracts in `lcs-shared`, publish a new version, and run `pnpm update-shared`. Resume only when instructed.

---

## Phase 2: Build the Hexagon Replacement

Once the parent agent confirms the new `@learncraft-spanish/shared` version is installed (`pnpm update-shared` has run), proceed inside-out.

Read `documentation/FEATURE_WORKFLOW.md` and `documentation/MIGRATION_GUIDE.md` before building. Verify every file against the relevant `BOUNDARIES.md` — **linter is not authoritative**.

### 2a. Domain types (`src/hexagon/domain/`) — if any frontend-only types are needed

Before writing the port, determine where each type lives:

- **Cross-cutting type** (used by both frontend and backend, defined in `lcs-shared`) → import from `@learncraft-spanish/shared`
- **Frontend-only type** (SPA-specific shape, display concern, or UI-only enrichment) → define in `src/hexagon/domain/` as a pure TypeScript type or interface

If the audit identified legacy types in `src/types/` that are frontend-only, extract and re-define them here using the new shared types as a base. Do not copy-paste legacy types — derive from `@learncraft-spanish/shared` where possible.

### 2b. Port (`src/hexagon/application/ports/`)

Define a TypeScript interface using only types from `@learncraft-spanish/shared` and `src/hexagon/domain/`.

```ts
// Example: src/hexagon/application/ports/studentsPort.ts
import type {
  Student,
  EditableStudent,
  NewStudent,
} from '@learncraft-spanish/shared';

export interface StudentsPort {
  getStudents: () => Promise<Student[]>;
  getStudentCohortFieldOptions: () => Promise<string[]>;
  updateStudent: (student: EditableStudent) => Promise<Student>;
  createStudent: (student: NewStudent) => Promise<Student>;
}
```

Rules: pure TypeScript interfaces only, no implementation, no React, no imports from `infrastructure/`.

### 2c. Infrastructure (`src/hexagon/infrastructure/`)

Implement the port using `createHttpClient` and **shared endpoint constants** from `@learncraft-spanish/shared`. Never hardcode path strings.

```ts
// Example: src/hexagon/infrastructure/studentsInfrastructure.ts
import type { AuthPort } from '@application/ports/authPort';
import type { Student } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getStudentsEndpoint,
  createStudentEndpoint,
  updateStudentEndpoint,
} from '@learncraft-spanish/shared';

export function createStudentsInfrastructure(apiUrl: string, auth: AuthPort) {
  const http = createHttpClient(apiUrl, auth);
  return {
    getStudents: () =>
      http.get<Student[]>(
        getStudentsEndpoint.path,
        getStudentsEndpoint.requiredScopes,
      ),
    // ...etc
  };
}
```

### 2d. Adapter (`src/hexagon/application/adapters/`)

Thin hook. No logic — just wires config + auth into the infrastructure factory.

```ts
// Example: src/hexagon/application/adapters/studentsAdapter.ts
import type { StudentsPort } from '@application/ports/studentsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createStudentsInfrastructure } from '@infrastructure/studentsInfrastructure';

export function useStudentsAdapter(): StudentsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createStudentsInfrastructure(apiUrl, auth);
}
```

### 2e. Queries (`src/hexagon/application/queries/`)

One hook per resource. Use TanStack Query. No business logic, no toasts — those belong in the interface/use-case layer.

```ts
// Example: src/hexagon/application/queries/useStudentsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { useStudentsAdapter } from '@application/adapters/studentsAdapter';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Student } from '@learncraft-spanish/shared';

export interface UseStudentsQueryReturn {
  studentsQuery: UseQueryResult<Student[]>;
}

export function useStudentsQuery(): UseStudentsQueryReturn {
  const { getStudents } = useStudentsAdapter();
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
    staleTime: Infinity,
  });
  return { studentsQuery };
}
```

Mutations follow the same pattern — explicit return type, adapter-sourced `mutationFn`, no toast inside the query hook.

### 2f. Use Case (`src/hexagon/application/useCases/`) — only if needed

Create a use case only if the table's data is composed with other queries for a single interface purpose. If the query hook alone is sufficient, skip this step.

### 2g. Legacy interface compatibility

The legacy UI in `src/sections/`, `src/components/`, `src/functions/`, and `src/types/` may break when the underlying types change. For each consumer identified in the Phase 1 audit:

1. **Check if the new shared/domain type is a superset** of the legacy type. If yes, update the import and verify the component still compiles — usually no logic changes needed.
2. **Check if the shape changed** (renamed fields, different nullability, restructured objects). Update props, destructuring, and any display logic to match the new shape.
3. **Check `src/types/DatabaseTables.ts` aliases** — if the legacy type was re-exported there, update or remove the alias to point to the new type.
4. **Do not refactor legacy components into hexagon** as part of this step — only make the minimal changes needed to keep the UI working with the new types.
5. Run `pnpm validate` after each file update to surface type errors early.

If a legacy consumer would require significant rework to be compatible, flag it to the parent agent rather than attempting a deep refactor here.

---

## Phase 3: Tests

Follow `documentation/TESTING_STANDARDS.md`. Minimum required:

| Layer             | What to test                                                                      |
| ----------------- | --------------------------------------------------------------------------------- |
| Port              | No tests (pure types)                                                             |
| Infrastructure    | No unit tests — covered by adapter + mock                                         |
| Adapter           | Create a colocated `*.mock.ts` with `createOverrideableMock`                      |
| Queries           | Integration test: renders with mock adapter, asserts loading/success/error states |
| Use case (if any) | Integration test: composes queries/units correctly                                |

Every exported data hook **must** have a colocated `*.mock.ts` before the PR is ready.

---

## Phase 4: Cleanup

**Do not delete legacy files** unless the parent agent explicitly instructs it. Some legacy hooks may still be consumed by legacy UI components. Report which legacy files are now candidates for deletion once their consumers are migrated.

Run validation before reporting complete:

```bash
pnpm validate
pnpm test:hexagon
```

Report any failures back to the parent agent with full error output.

---

## Checklist (copy and track progress)

```
Phase 1 — Audit
- [ ] All legacy files identified
- [ ] All hardcoded API paths captured
- [ ] All legacy types identified and classified (shared vs frontend-only)
- [ ] All legacy interface consumers identified (src/sections, src/components, src/functions, src/types)
- [ ] Audit report sent to parent agent
- [ ] Waiting for pnpm update-shared confirmation

Phase 2 — Hexagon build
- [ ] Frontend-only domain types defined in src/hexagon/domain/ (if needed)
- [ ] Port defined
- [ ] Infrastructure implemented (shared endpoints only)
- [ ] Adapter written (thin hook)
- [ ] Query hook(s) written
- [ ] Use case written (if needed)
- [ ] Legacy interface consumers updated (minimal changes, UI still works)
- [ ] pnpm validate passes after interface updates

Phase 3 — Tests
- [ ] Mock file(s) created for all exported hooks
- [ ] Query tests written
- [ ] Use case tests written (if applicable)
- [ ] pnpm validate passes
- [ ] pnpm test:hexagon passes

Phase 4 — Handoff
- [ ] Legacy files listed as deletion candidates
- [ ] Report sent to parent agent
```

---

## Reference

- Architecture rules: `src/hexagon/ARCHITECTURE.md`
- Layer boundaries: `src/hexagon/[layer]/BOUNDARIES.md` (authoritative — not the linter)
- Migration patterns: `documentation/MIGRATION_GUIDE.md`
- Feature workflow: `documentation/FEATURE_WORKFLOW.md`
- Testing standards: `documentation/TESTING_STANDARDS.md`
- Known tables: [TABLES.md](TABLES.md)
- Example implementation chain: `pmfSurveyFrequencyPort.ts` → `pmfSurveyFrequencyInfrastructure.ts` → `pmfSurveyFrequencyAdapter.ts`
