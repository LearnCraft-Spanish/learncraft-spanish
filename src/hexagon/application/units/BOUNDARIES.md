# Units Boundaries

## What is This?

Units are **reusable, composable logic hooks** with single responsibilities. They provide building blocks that use-cases compose into complete workflows. Units are **not** directly accessible from the interface layer.

## Responsibility

Reusable, focused functionality:

- Handle specific, focused functionality
- Provide composable building blocks
- Manage local state (not shared across features)
- Transform or process data
- Implement focused business logic
- Are reused across different use-cases

## ⚠️ Critical Rules

### ✅ DO

- Keep single responsibility (one focused task)
- Make hooks composable and reusable
- Use React hooks for local state
- **Use EXPLICIT return types for ALL hooks** - Export interfaces, never use inferred types or `typeof`
- Return focused, typed interfaces
- Write 100% test coverage (`*.test.ts`)
- Keep units independent (minimal dependencies)

### ❌ DON'T

- **NO direct calls from interface** (interface calls use-cases, not units)
- **NO orchestration** (that's use-cases' job)
- **NO shared application state** (use coordinators for that)
- **NO complete workflows** (that's use-cases' job)
- **NO infrastructure imports** (use adapters through use-cases or queries)
- **NO rendering logic** (no JSX, no components)
- **NO classes or OOP** (functions/hooks only)

## Dependency Rules

**Units can depend on:**

- ✅ `domain/` - Pure business logic
- ✅ Other `application/units/` - Compose smaller units
- ✅ `application/queries/` - Data fetching (sparingly)
- ❌ Cannot import from `application/useCases/` (avoid circular dependencies)
- ❌ Cannot import from `application/coordinators/` (units are independent)
- ❌ Cannot import from `application/adapters/` directly (go through use-cases)
- ❌ Cannot be imported by `interface/` (must go through use-cases)
- ❌ Cannot be imported by `domain/`

## Examples of What Belongs Here

```typescript
// ✅ Reusable pagination logic (EXPLICIT return type)
export interface UsePaginationResult<T> {
  paginated: T[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T>(items: T[], pageSize: number = 10): UsePaginationResult<T> {
  const [page, setPage] = useState(1);
  
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);
  
  const totalPages = Math.ceil(items.length / pageSize);
  
  return {
    paginated,
    page,
    totalPages,
    setPage,
    nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setPage(p => Math.max(1, p - 1)),
  };
}

// ✅ Focused filtering logic (EXPLICIT return type)
export interface UseFilteringResult<T> {
  filtered: T[];
}

export function useFiltering<T>(
  items: T[],
  filterFn: (item: T) => boolean
): UseFilteringResult<T> {
  const filtered = useMemo(() => {
    return items.filter(filterFn);
  }, [items, filterFn]);
  
  return { filtered };
}

// ✅ Data transformation hook
export function useAudioQuizMapper(examples: Example[]) {
  const mapped = useMemo(() => {
    return examples.map(example => ({
      id: example.id,
      audioUrl: example.audioUrl,
      correctAnswer: example.spanish,
      // ... transformation logic
    }));
  }, [examples]);
  
  return { mappedExamples: mapped };
}

// ✅ Local state management
export function useCustomQuizSettingsState() {
  const [settings, setSettings] = useState<QuizSettings>(defaultSettings);
  
  const updateSetting = useCallback((key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  return { settings, updateSetting };
}
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ Orchestration across multiple units (belongs in useCases/)
export function useCustomQuiz() {
  const vocab = useVocabulary();
  const examples = useExamples();
  const filter = useFiltering(vocab);
  // ... orchestrating multiple units - belongs in use-case
}

// ❌ Shared application state (belongs in coordinators/)
export function useSelectedLesson() {
  // If this is shared across features, it belongs in coordinators
  const [lesson, setLesson] = useState(null);
  return { lesson, setLesson };
}

// ❌ Complete workflow (belongs in useCases/)
export function useVerbCreation() {
  // Complete CRUD workflow - belongs in use-case
}

// ❌ Direct infrastructure (belongs in adapters/)
export function useVocabularyData() {
  return httpClient.get('/api/vocabulary'); // NO!
}

// ❌ Rendering logic
export function VocabularyList() {
  return <div>...</div>; // NO!
}
```

## Testing Requirements

- **100% test coverage** required
- Test units in isolation
- Mock dependencies (other units, queries) when needed
- Colocated test files: `*.test.ts`
- Use typed mocks (`createTypedMock<T>()`, not `vi.fn()`)

## Structure Pattern

Units can be organized by functionality:

```
units/
├── Pagination/
│   ├── usePagination.ts
│   └── usePagination.test.ts
├── Filtering/
│   ├── useCombinedFilters.ts
│   └── ...
└── useAudioQuiz.ts      - Standalone unit
    └── useAudioQuiz.test.ts
```

## Reading Order

1. `domain/` - Understand available transformations
2. `units/` - See available building blocks
3. `useCases/` - See how units are composed
4. `queries/` - See data fetching patterns (if needed)

## Where to Add Code?

- New reusable logic → New unit file
- New data transformation → New unit file
- New local state hook → New unit file
- New composable functionality → New unit file or directory

## Key Distinctions

**Units vs Use Cases:**
- Units = Building blocks, single responsibilities
- Use cases = Complete workflows, orchestration

**Units vs Queries:**
- Units = Logic and transformations
- Queries = Data fetching (units may use queries, but queries are simpler)

**Units vs Coordinators:**
- Units = Local state, independent functionality
- Coordinators = Shared state, cross-cutting concerns

## Composition Principle

Units should be **composable** - they can be combined in use-cases:

```typescript
// Use-case composes multiple units
export function useCustomQuiz() {
  const { vocabulary } = useVocabulary();      // unit
  const { filtered } = useFiltering(vocabulary); // unit
  const { paginated } = usePagination(filtered); // unit
  // ... orchestration
}
```

Units should **not** compose other units unnecessarily - keep them focused and independent.

