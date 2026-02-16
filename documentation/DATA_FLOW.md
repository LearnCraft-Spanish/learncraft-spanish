# 📊 Data Flow & State Management Guide

_Understanding how data moves through the LearnCraft Spanish application_

---

## Overview

LearnCraft Spanish uses a combination of state management patterns:

- **TanStack Query (React Query)** for server state (API data)
- **React Context** for global UI state and shared resources
- **Local React State** for component-specific UI state
- **Hexagonal Architecture** for clean separation of concerns

---

## State Categories

### 1. Server State (TanStack Query)

**What it is**: Data that lives on the backend and is fetched/synchronized with the frontend.

**Examples**:
- User data and authentication status
- Course and lesson information
- Vocabulary lists and examples
- Quiz questions and results
- Flashcard data
- Student progress and statistics

**Location**: `src/hexagon/application/queries/*.ts`

**Pattern**:

```typescript
// Query definition
export function useOfficialQuizzesQuery() {
  const adapter = useOfficialQuizAdapter();
  
  return useQuery({
    queryKey: ['officialQuizzes'],
    queryFn: () => adapter.getAllQuizzes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mock for testing
export const useOfficialQuizzesQueryMock = createOverrideableMock<typeof useOfficialQuizzesQuery>({
  defaultImplementation: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
});
```

**Best Practices**:
- Use `useQuery` for GET operations
- Use `useMutation` for POST/PUT/DELETE operations
- Set appropriate `staleTime` and `cacheTime`
- Always provide `queryKey` for cache management
- Colocate `.mock.ts` files for testing

### 2. Global UI State (React Context)

**What it is**: Shared state that multiple components need access to, but doesn't come from the server.

**Examples**:
- Audio player state and controls
- Modal open/close state
- Selected lesson or quiz configuration
- Current user's app-level preferences
- Theme or display settings

**Location**: `src/hexagon/composition/context/*.tsx` and `src/hexagon/application/coordinators/`

**Pattern**:

```typescript
// Context definition
export interface AudioContextValue {
  currentAudio: string | null;
  play: (audioUrl: string) => void;
  pause: () => void;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

// Provider
export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const play = useCallback((audioUrl: string) => {
    setCurrentAudio(audioUrl);
    setIsPlaying(true);
  }, []);
  
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  return (
    <AudioContext.Provider value={{ currentAudio, play, pause, isPlaying }}>
      {children}
    </AudioContext.Provider>
  );
}

// Hook to use the context
export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
}
```

**Best Practices**:
- Keep context values stable (use `useMemo` for objects)
- Split contexts by concern (don't create one giant context)
- Provide custom hooks for accessing context (`useAudioContext`)
- Throw errors if context is used outside provider
- Document what each context is responsible for

### 3. Local Component State (useState)

**What it is**: State that only matters to a single component and its children.

**Examples**:
- Form input values before submission
- Accordion expanded/collapsed state
- Dropdown menu open/closed
- Hover states and temporary UI feedback
- Pagination current page

**Location**: Within individual components

**Pattern**:

```typescript
function ExampleSearchForm() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    level: 'all',
    category: 'all',
  });
  
  const handleSubmit = () => {
    // Use state in submission
    onSearch(searchTerm, filters);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form inputs that update local state */}
    </form>
  );
}
```

**Best Practices**:
- Keep it local - don't lift state unnecessarily
- Use controlled components for forms
- Derive state when possible rather than duplicating
- Clean up side effects in `useEffect` cleanup functions

---

## Data Flow Patterns

### Pattern 1: Fetching and Displaying Data

```
User Action (click/load)
  ↓
Page Component calls Use Case
  ↓
Use Case calls Query (TanStack Query)
  ↓
Query calls Adapter
  ↓
Adapter calls Infrastructure (HTTP client)
  ↓
API Request to Backend
  ↓
Response cached by TanStack Query
  ↓
Use Case receives data
  ↓
Page Component receives data from Use Case
  ↓
Component renders data
```

**Example**:

```typescript
// Page (Interface Layer)
function OfficialQuizzesPage() {
  const useCase = useOfficialQuizzes();
  
  return (
    <div>
      {useCase.isLoading && <Loading />}
      {useCase.quizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
    </div>
  );
}

// Use Case (Application Layer)
function useOfficialQuizzes() {
  const query = useOfficialQuizzesQuery();
  
  return {
    quizzes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

// Query (Application Layer)
function useOfficialQuizzesQuery() {
  const adapter = useOfficialQuizAdapter();
  
  return useQuery({
    queryKey: ['officialQuizzes'],
    queryFn: () => adapter.getAllQuizzes(),
  });
}

// Adapter (Application Layer)
function useOfficialQuizAdapter(): OfficialQuizPort {
  return useOfficialQuizInfrastructure();
}

// Infrastructure (Infrastructure Layer)
function useOfficialQuizInfrastructure(): OfficialQuizPort {
  const http = useHttpClient();
  
  return {
    getAllQuizzes: () => http.get('/api/quizzes'),
    // ... other methods
  };
}
```

### Pattern 2: Mutations (Creating/Updating Data)

```
User Action (submit form)
  ↓
Page Component calls Use Case
  ↓
Use Case calls Mutation (TanStack Query)
  ↓
Mutation calls Adapter
  ↓
Adapter calls Infrastructure
  ↓
API Request to Backend (POST/PUT/DELETE)
  ↓
Response returned
  ↓
TanStack Query invalidates related queries
  ↓
Queries refetch automatically
  ↓
UI updates with fresh data
```

**Example**:

```typescript
// Use Case
function useCreateVocabulary() {
  const adapter = useVocabularyAdapter();
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (vocab: VocabularyInput) => adapter.createVocabulary(vocab),
    onSuccess: () => {
      // Invalidate and refetch vocabulary list
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
  
  return {
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  };
}
```

### Pattern 3: Coordinated State (Multiple Sources)

When a feature needs data from multiple sources or needs to coordinate multiple pieces of state:

```
Page Component calls Use Case
  ↓
Use Case combines multiple Units
  ↓
Unit 1: Fetches data (Query)
Unit 2: Manages UI state (useState)
Unit 3: Accesses global state (Context)
  ↓
Use Case orchestrates and combines results
  ↓
Page Component receives unified interface
```

**Example**:

```typescript
// Use Case (orchestrates multiple units)
function useFlashcardManager() {
  // Unit: Fetch user's flashcards
  const flashcardsQuery = useStudentFlashcardsQuery();
  
  // Unit: Manage bulk selection state
  const bulkSelect = useBulkSelect(flashcardsQuery.data ?? []);
  
  // Unit: Handle flashcard updates
  const updateFlashcards = useFlashcardUpdateUnit();
  
  // Unit: Access audio coordinator for pronunciation
  const audio = useAudioCoordinator();
  
  // Orchestrate everything into a single interface
  return {
    flashcards: flashcardsQuery.data ?? [],
    isLoading: flashcardsQuery.isLoading,
    selectedIds: bulkSelect.selectedIds,
    selectFlashcard: bulkSelect.select,
    updateFlashcard: updateFlashcards.update,
    playAudio: audio.play,
  };
}
```

---

## Coordinator Pattern

**Coordinators** manage global, cross-cutting concerns that multiple features need access to.

**Examples**:
- `useAudioCoordinator`: Manages audio playback across the app
- `useAuthCoordinator`: Manages authentication state and permissions
- `useAppUserCoordinator`: Manages current user profile and settings

**Location**: `src/hexagon/application/coordinators/`

**Pattern**:

```typescript
// Coordinator Hook
export function useAudioCoordinator(): AudioCoordinatorResult {
  const audioContext = useAudioContext(); // Access global context
  
  const play = useCallback((audioUrl: string) => {
    audioContext.play(audioUrl);
  }, [audioContext]);
  
  return {
    currentAudio: audioContext.currentAudio,
    isPlaying: audioContext.isPlaying,
    play,
    pause: audioContext.pause,
  };
}

// Coordinator Provider (if needed)
export function AudioCoordinatorProvider({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  );
}
```

---

## Cache Management

### Query Invalidation

TanStack Query caches data automatically. When you mutate data, invalidate related queries:

```typescript
// After creating a new vocabulary item
queryClient.invalidateQueries({ queryKey: ['vocabulary'] });

// After updating a specific quiz
queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });

// Invalidate multiple related queries
queryClient.invalidateQueries({ queryKey: ['student', studentId] });
queryClient.invalidateQueries({ queryKey: ['flashcards'] });
```

### Optimistic Updates

For a better UX, update the cache optimistically before the API responds:

```typescript
const updateVocabMutation = useMutation({
  mutationFn: (vocab: Vocabulary) => adapter.updateVocabulary(vocab),
  onMutate: async (newVocab) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['vocabulary', newVocab.id] });
    
    // Snapshot current value
    const previousVocab = queryClient.getQueryData(['vocabulary', newVocab.id]);
    
    // Optimistically update
    queryClient.setQueryData(['vocabulary', newVocab.id], newVocab);
    
    return { previousVocab };
  },
  onError: (_err, _newVocab, context) => {
    // Rollback on error
    if (context?.previousVocab) {
      queryClient.setQueryData(['vocabulary', context.previousVocab.id], context.previousVocab);
    }
  },
  onSettled: (vocab) => {
    // Refetch to ensure server state
    queryClient.invalidateQueries({ queryKey: ['vocabulary', vocab?.id] });
  },
});
```

---

## Common Pitfalls

### ❌ Fetching Data in Components

```typescript
// DON'T: Fetch directly in component
function BadComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{/* render */}</div>;
}
```

```typescript
// DO: Use TanStack Query through a use case
function GoodComponent() {
  const useCase = useMyFeature(); // Use case handles query
  
  return <div>{/* render with useCase.data */}</div>;
}
```

### ❌ Prop Drilling

```typescript
// DON'T: Pass data through many layers
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data} />
    </Child>
  </Parent>
</GrandParent>
```

```typescript
// DO: Use context or fetch at the component that needs it
<GrandParent>
  <Parent>
    <Child>
      <GrandChild /> {/* Uses useContext or useQuery internally */}
    </Child>
  </Parent>
</GrandParent>
```

### ❌ Duplicate State

```typescript
// DON'T: Store derived state
function BadComponent({ items }) {
  const [items, setItems] = useState(props.items);
  const [filteredItems, setFilteredItems] = useState([]); // Duplicate!
  
  useEffect(() => {
    setFilteredItems(items.filter(predicate));
  }, [items]);
}
```

```typescript
// DO: Derive on render
function GoodComponent({ items }) {
  const [filterValue, setFilterValue] = useState('');
  
  const filteredItems = useMemo(
    () => items.filter(item => item.name.includes(filterValue)),
    [items, filterValue]
  );
}
```

---

## Debugging Data Flow

### Tools

1. **React DevTools**: Inspect component props and state
2. **TanStack Query DevTools**: View query status, cache, and refetch behavior
3. **Network Tab**: Monitor API calls and responses
4. **Redux DevTools**: (If using Redux in legacy code)

### Common Issues

**Problem**: Data not updating after mutation
- **Solution**: Check if you're invalidating the right query keys

**Problem**: Infinite render loops
- **Solution**: Check dependencies in `useEffect`, `useMemo`, `useCallback`

**Problem**: Stale data showing
- **Solution**: Adjust `staleTime` and `cacheTime` in your query

**Problem**: Component re-rendering too much
- **Solution**: Memoize callbacks, objects, and expensive computations

---

## Best Practices Summary

1. ✅ Use TanStack Query for all server data
2. ✅ Use Context for global UI state (audio, modals, etc.)
3. ✅ Use local state for component-specific UI
4. ✅ Coordinate related state in use cases
5. ✅ Invalidate queries after mutations
6. ✅ Keep query keys consistent and well-organized
7. ✅ Provide mocks for all queries
8. ✅ Derive state when possible, don't duplicate
9. ✅ Use coordinators for cross-cutting concerns
10. ✅ Test data flow with mocked queries and adapters

---

## Related Documentation

- [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Hexagonal architecture details
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - How to test data flow
- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - Code patterns and conventions
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Common issues and solutions
