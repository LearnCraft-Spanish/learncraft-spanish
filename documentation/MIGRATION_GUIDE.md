# 🔄 Legacy to Hexagon Migration Guide

_How to migrate code from legacy structure to hexagonal architecture_

---

## Overview

The LearnCraft Spanish codebase is actively migrating from a legacy structure to a modern hexagonal architecture. This guide explains how to identify, refactor, and move code into the hexagon.

---

## Why Migrate?

### Benefits of Hexagonal Architecture

- ✅ **Better testability**: Pure functions and isolated layers
- ✅ **Clear boundaries**: Each layer has a single responsibility
- ✅ **Maintainability**: Easier to understand and modify
- ✅ **Scalability**: Can grow without becoming a mess
- ✅ **Flexibility**: Easy to swap implementations (API, UI framework)

### Current State

```
src/
├── hexagon/              # ✅ Modern architecture (target)
│   ├── domain/           # Pure business logic
│   ├── application/      # Use cases and orchestration
│   ├── infrastructure/   # External service adapters
│   ├── interface/        # React components
│   └── composition/      # App bootstrap
├── components/           # ❌ Legacy components (to migrate)
├── hooks/                # ❌ Legacy hooks (to migrate)
├── sections/             # ❌ Legacy sections (to migrate)
├── types/                # ❌ Legacy types (to migrate)
└── functions/            # ❌ Legacy utilities (to migrate)
```

---

## When to Migrate

### Migrate Immediately When:

1. **Creating new features**: Always use hexagonal architecture
2. **Major refactoring**: If rewriting significant portions of code
3. **Fixing architecture violations**: If code has circular dependencies or mixed concerns

### Migrate Incrementally When:

1. **Bug fixing**: If touching legacy code, consider migrating the affected module
2. **Adding tests**: Good opportunity to restructure for testability
3. **Working nearby**: If working in hexagon and need legacy functionality

### Don't Migrate When:

1. **Emergency hotfixes**: Focus on fixing the issue first
2. **Minor tweaks**: One-line changes to stable code
3. **Deprecation planned**: If code will be removed soon

---

## Migration Process

### Step 1: Analyze the Code

Identify what the code does and where it belongs:

**Ask yourself**:

- What business logic does this contain? → Domain
- Does it orchestrate multiple operations? → Application (use case)
- Does it call an outside service? → Infrastructure
- Does it render UI? → Interface
- Does it set up the app? → Composition

**Example Analysis**:

```typescript
// Legacy: src/hooks/useFlashcards.ts
function useFlashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const { user } = useAuth0();

  useEffect(() => {
    fetch(`/api/flashcards?userId=${user.id}`)
      .then((res) => res.json())
      .then(setFlashcards);
  }, [user.id]);

  const create = (data) => {
    fetch('/api/flashcards', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((newFlashcard) => {
        setFlashcards((prev) => [...prev, newFlashcard]);
      });
  };

  return { flashcards, create };
}
```

**Analysis**:

- Mixes data fetching (infrastructure) with state management (application)
- Should be split into:
  - Infrastructure: HTTP client for flashcard API
  - Application: Query and mutation hooks
  - Application: Use case to orchestrate

---

### Step 2: Extract Domain Logic (if any)

Move pure business logic to the domain layer.

**Before**:

```typescript
// Legacy: src/hooks/useQuizScoring.ts
function useQuizScoring() {
  const calculateScore = (answers, correctAnswers) => {
    let score = 0;
    answers.forEach((answer, idx) => {
      if (answer === correctAnswers[idx]) {
        score += answer.attempts === 1 ? 100 : 50;
      }
    });
    return (score / (correctAnswers.length * 100)) * 100;
  };

  return { calculateScore };
}
```

**After**:

```typescript
// Hexagon: src/hexagon/domain/quiz/scoring.ts
export interface QuizAnswer {
  text: string;
  attempts: number;
}

export function calculateQuizScore(
  answers: QuizAnswer[],
  correctAnswers: string[],
): number {
  let score = 0;

  answers.forEach((answer, idx) => {
    if (answer.text === correctAnswers[idx]) {
      const points = answer.attempts === 1 ? 100 : 50;
      score += points;
    }
  });

  return (score / (correctAnswers.length * 100)) * 100;
}
```

---

### Step 3: Create Infrastructure Adapters

Move API calls and external dependencies to infrastructure.

**Before**:

```typescript
// Legacy: Direct API calls in component/hook
fetch('/api/flashcards')
  .then((res) => res.json())
  .then(setFlashcards);
```

**After**:

```typescript
// Step 3a: Define port in application layer
// src/hexagon/application/ports/flashcardPort.ts
export interface FlashcardPort {
  getAll: (userId: string) => Promise<Flashcard[]>;
  create: (data: FlashcardInput) => Promise<Flashcard>;
  update: (id: string, data: FlashcardInput) => Promise<Flashcard>;
  delete: (id: string) => Promise<void>;
}

// Step 3b: Implement infrastructure
// src/hexagon/infrastructure/flashcardInfrastructure.ts
export function useFlashcardInfrastructure(): FlashcardPort {
  const httpClient = useHttpClient();

  return {
    getAll: (userId: string) => httpClient.get(`/flashcards?userId=${userId}`),

    create: (data: FlashcardInput) => httpClient.post('/flashcards', data),

    update: (id: string, data: FlashcardInput) =>
      httpClient.put(`/flashcards/${id}`, data),

    delete: (id: string) => httpClient.delete(`/flashcards/${id}`),
  };
}

// Step 3c: Create adapter
// src/hexagon/application/adapters/flashcardAdapter.ts
export function useFlashcardAdapter(): FlashcardPort {
  return useFlashcardInfrastructure();
}

// Step 3d: Create mock for testing
// src/hexagon/application/adapters/flashcardAdapter.mock.ts
export const flashcardAdapterMock = createOverrideableMock<FlashcardPort>({
  defaultImplementation: {
    getAll: vi.fn(() => Promise.resolve([])),
    create: vi.fn(() => Promise.resolve(mockFlashcard)),
    update: vi.fn(() => Promise.resolve(mockFlashcard)),
    delete: vi.fn(() => Promise.resolve()),
  },
});
```

---

### Step 4: Create Application Layer Queries

Use TanStack Query for data fetching.

```typescript
// src/hexagon/application/queries/useFlashcardsQuery.ts
export function useFlashcardsQuery(userId: string) {
  const adapter = useFlashcardAdapter();

  return useQuery({
    queryKey: ['flashcards', userId],
    queryFn: () => adapter.getAll(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// src/hexagon/application/queries/useFlashcardsQuery.mock.ts
export const useFlashcardsQueryMock = createOverrideableMock<
  typeof useFlashcardsQuery
>({
  defaultImplementation: () => ({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  }),
});
```

---

### Step 5: Create Use Case

Orchestrate queries and mutations into a cohesive use case.

```typescript
// src/hexagon/application/useCases/useFlashcardManager/index.ts
export interface FlashcardManagerResult {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: Error | null;
  createFlashcard: (data: FlashcardInput) => Promise<void>;
  updateFlashcard: (id: string, data: FlashcardInput) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
}

export function useFlashcardManager(userId: string): FlashcardManagerResult {
  const query = useFlashcardsQuery(userId);
  const createMutation = useCreateFlashcardMutation();
  const updateMutation = useUpdateFlashcardMutation();
  const deleteMutation = useDeleteFlashcardMutation();

  const createFlashcard = useCallback(
    async (data: FlashcardInput) => {
      await createMutation.mutateAsync(data);
      toast.success('Flashcard created');
    },
    [createMutation],
  );

  const updateFlashcard = useCallback(
    async (id: string, data: FlashcardInput) => {
      await updateMutation.mutateAsync({ id, data });
      toast.success('Flashcard updated');
    },
    [updateMutation],
  );

  const deleteFlashcard = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
      toast.success('Flashcard deleted');
    },
    [deleteMutation],
  );

  return {
    flashcards: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  };
}
```

---

### Step 6: Migrate Components

Move components to interface layer.

**Before**:

```typescript
// Legacy: src/components/FlashcardList.tsx
export function FlashcardList() {
  const { flashcards, isLoading, create } = useFlashcards(); // Legacy hook
  const [showForm, setShowForm] = useState(false);

  // ... lots of mixed logic

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

**After**:

```typescript
// Hexagon: src/hexagon/interface/pages/FlashcardsPage.tsx
export function FlashcardsPage() {
  const { user } = useAuth0();
  const useCase = useFlashcardManager(user.id); // Use case from application layer

  if (useCase.isLoading) {
    return <Loading />;
  }

  if (useCase.error) {
    return <Error message={useCase.error.message} />;
  }

  return (
    <div>
      <FlashcardList flashcards={useCase.flashcards} />
      <CreateFlashcardButton onCreate={useCase.createFlashcard} />
    </div>
  );
}

// Separate into smaller components
// src/hexagon/interface/components/FlashcardList/index.tsx
interface FlashcardListProps {
  flashcards: Flashcard[];
}

export function FlashcardList({ flashcards }: FlashcardListProps) {
  if (flashcards.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul>
      {flashcards.map(fc => (
        <FlashcardCard key={fc.id} flashcard={fc} />
      ))}
    </ul>
  );
}
```

---

### Step 7: Update Tests

Write tests for the new hexagonal structure.

```typescript
// src/hexagon/application/useCases/useFlashcardManager/index.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlashcardManager } from './index';
import { useFlashcardsQueryMock } from '../../queries/useFlashcardsQuery.mock';

vi.mock('../../queries/useFlashcardsQuery', () => ({
  useFlashcardsQuery: vi.fn(() =>
    useFlashcardsQueryMock.defaultImplementation(),
  ),
}));

describe('useFlashcardManager', () => {
  beforeEach(() => {
    useFlashcardsQueryMock.resetMock();
  });

  it('should return flashcards from query', () => {
    const mockFlashcards = [{ id: '1', front: 'Hello', back: 'Hola' }];
    useFlashcardsQueryMock.overrideMock({ data: mockFlashcards });

    const { result } = renderHook(() => useFlashcardManager('user-123'));

    expect(result.current.flashcards).toEqual(mockFlashcards);
  });

  it('should handle loading state', () => {
    useFlashcardsQueryMock.overrideMock({ isLoading: true });

    const { result } = renderHook(() => useFlashcardManager('user-123'));

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const error = new Error('Failed to fetch');
    useFlashcardsQueryMock.overrideMock({ error });

    const { result } = renderHook(() => useFlashcardManager('user-123'));

    expect(result.current.error).toBe(error);
  });
});
```

---

### Step 8: Remove Legacy Code

Once the new code is tested and working:

1. **Update imports**: Change all imports to use new hexagon paths
2. **Verify functionality**: Test thoroughly in dev
3. **Delete legacy files**: Remove old code
4. **Update documentation**: If any docs reference old structure

```bash
# Example: Removing legacy code
git rm src/hooks/useFlashcards.ts
git rm src/components/FlashcardList.tsx

# Commit the migration
git add .
git commit -m "feat: migrate flashcard feature to hexagonal architecture"
```

---

## Common Migration Patterns

### Pattern 1: Component with Data Fetching

**Before**: Component fetches its own data

```typescript
function LegacyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);

  return <div>{data.map(/* render */)}</div>;
}
```

**After**: Page calls use case, component receives props

```typescript
// Page
function DataPage() {
  const useCase = useDataManager();

  return <DataList data={useCase.data} />;
}

// Component
function DataList({ data }: { data: Data[] }) {
  return <div>{data.map(/* render */)}</div>;
}
```

---

### Pattern 2: Mixed Concerns Hook

**Before**: Hook does everything

```typescript
function useLegacyFeature() {
  const [state, setState] = useState();
  const [data, setData] = useState();

  // API call
  useEffect(() => {
    /* fetch */
  }, []);

  // Business logic
  const compute = () => {
    /* logic */
  };

  // UI state
  const toggle = () => setState((prev) => !prev);

  return { state, data, compute, toggle };
}
```

**After**: Split by layer

```typescript
// Domain: Pure logic
export function computeValue(input: Input): Output {
  // Pure function
}

// Application: Query
export function useDataQuery() {
  return useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
}

// Application: Use case (orchestration)
export function useFeatureManager() {
  const query = useDataQuery();
  const [state, setState] = useState();

  const compute = useCallback(() => {
    return computeValue(query.data); // Use domain function
  }, [query.data]);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  return { state, data: query.data, compute, toggle };
}

// Interface: Component
function FeaturePage() {
  const useCase = useFeatureManager();
  // render
}
```

---

## Migration Checklist

Use this checklist when migrating a feature:

```
## Migration Checklist

### Analysis
- [ ] Identified all legacy files involved
- [ ] Determined layer for each piece of logic (domain/app/infra/interface)
- [ ] Checked for dependencies on other legacy code
- [ ] Reviewed existing hexagon code for similar patterns

### Implementation
- [ ] Extracted pure functions to domain layer (if any)
- [ ] Created infrastructure adapter and port
- [ ] Created application layer queries/mutations
- [ ] Created use case to orchestrate
- [ ] Migrated components to interface layer
- [ ] Created mocks for all data-returning hooks

### Testing
- [ ] Wrote tests for domain functions
- [ ] Wrote tests for use case
- [ ] Wrote tests for interface components
- [ ] All tests passing
- [ ] Tested manually in browser

### Cleanup
- [ ] Updated all imports to use new code
- [ ] Verified no references to legacy files remain
- [ ] Deleted legacy files
- [ ] Updated documentation if needed

### Review
- [ ] Code follows hexagonal architecture standards
- [ ] Dependencies flow inward only
- [ ] Explicit return types on all hooks
- [ ] Proper error handling
- [ ] PR checklist completed
```

---

## Tips and Best Practices

### Do's ✅

- **Start small**: Migrate one feature at a time
- **Test first**: Ensure existing functionality works before and after
- **Follow patterns**: Look at existing hexagon code for reference
- **Ask questions**: Get feedback early if unsure about structure
- **Document**: Add comments explaining complex migrations

### Don'ts ❌

- **Don't mix old and new**: Don't import legacy code into hexagon
- **Don't rush**: Take time to structure properly
- **Don't skip tests**: Tests are critical for safe migrations
- **Don't create hybrid code**: Either fully migrate or leave in legacy
- **Don't leave orphaned files**: Clean up after migration

---

## Examples in Codebase

Look at these successfully migrated features for reference:

1. **Official Quizzes**: `src/hexagon/application/useCases/useOfficialQuizzes/`
2. **Flashcard Manager**: `src/hexagon/application/useCases/useFlashcardManager/`
3. **Audio Quiz**: `src/hexagon/application/units/AudioQuiz/`
4. **Vocabulary Query**: `src/hexagon/application/queries/useVocabularyQuery.ts`

---

## Getting Help

If you're unsure about a migration:

1. **Review this guide** and existing hexagon code
2. **Check** [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) for layer rules
3. **Draft a plan** and share with the team for feedback
4. **Pair program** with someone who has done migrations before
5. **Start small** with a simpler feature to learn the pattern

---

## Related Documentation

- [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Hexagonal architecture details
- [`FEATURE_WORKFLOW.md`](./FEATURE_WORKFLOW.md) - Building new features
- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - Code patterns and conventions
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing requirements
- [`DATA_FLOW.md`](./DATA_FLOW.md) - State management patterns

---

**Remember**: Migration is about improving code quality and maintainability. Take your time, follow the patterns, and don't hesitate to ask for help!
