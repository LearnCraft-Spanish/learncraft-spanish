# Legacy to Hexagon Migration Guide

_How to migrate code from legacy structure to hexagonal architecture._

For code patterns, see [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md). For architecture rules, see [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md).

---

## Current State

```
src/
├── hexagon/              # Modern architecture (target)
├── components/           # Legacy components (to migrate)
├── hooks/                # Legacy hooks (to migrate)
├── sections/             # Legacy sections (to migrate)
├── types/                # Legacy types (to migrate)
└── functions/            # Legacy utilities (to migrate)
```

---

## When to Migrate

**Migrate immediately**: New features, major refactors, fixing architecture violations.

**Migrate incrementally**: Bug fixes touching legacy code, adding tests to legacy code, working near hexagon code that needs legacy functionality.

**Don't migrate**: Emergency hotfixes, one-line changes to stable code, code slated for removal.

---

## Migration Process

### Step 1: Analyze

Read the legacy code and classify each piece:

| What it does | Target layer |
|---|---|
| Pure business logic, validation, calculations | Domain |
| Orchestrates operations, manages state | Application (use case) |
| Calls external APIs | Infrastructure |
| Renders UI | Interface |
| Wires things together | Composition |

### Step 2: Build the Hexagon Replacement

Follow the same inside-out process as new features (see [`FEATURE_WORKFLOW.md`](./FEATURE_WORKFLOW.md)):

1. Extract pure functions → Domain
2. Define port interface → Application
3. Implement adapter → Infrastructure
4. Create queries/mutations → Application
5. Build use case → Application
6. Move/rebuild components → Interface
7. Write tests at every step

### Step 3: Switch Over

1. Update all imports to use new hexagon paths
2. Verify functionality manually and with tests
3. Delete legacy files
4. Commit the migration

---

## Common Legacy Patterns → Hexagon Equivalents

| Legacy pattern | Hexagon equivalent |
|---|---|
| `useEffect` + `fetch` in component | TanStack Query through use case |
| Business logic in component | Domain pure function |
| One hook doing everything | Use case composing units |
| Direct API calls in hooks | Infrastructure adapter behind port |
| `useState` for server data | TanStack Query cache |

---

## Migration Checklist

### Analysis
- [ ] Identified all legacy files involved
- [ ] Classified each piece by layer
- [ ] Checked for dependencies on other legacy code
- [ ] Reviewed existing hexagon code for similar patterns

### Implementation
- [ ] Extracted pure functions to domain (if any)
- [ ] Created port and infrastructure adapter
- [ ] Created queries/mutations
- [ ] Created use case
- [ ] Migrated components to interface layer
- [ ] Created mocks for all data-returning hooks

### Testing
- [ ] Domain functions tested
- [ ] Use case tested
- [ ] Components tested
- [ ] All tests passing
- [ ] Manual testing complete

### Cleanup
- [ ] All imports updated
- [ ] No references to legacy files remain
- [ ] Legacy files deleted
- [ ] Dependencies flow inward only
- [ ] Explicit return types on all hooks

---

## Reference Implementations

Look at these migrated features for patterns:

- `src/hexagon/application/useCases/useOfficialQuizzes/`
- `src/hexagon/application/useCases/useFlashcardManager/`
- `src/hexagon/application/units/AudioQuiz/`
