# 🎯 Common Patterns & Conventions

_Code patterns, conventions, and best practices for LearnCraft Spanish_

---

## Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [File Organization](#file-organization)
3. [TypeScript Patterns](#typescript-patterns)
4. [React Patterns](#react-patterns)
5. [Hook Patterns](#hook-patterns)
6. [Testing Patterns](#testing-patterns)
7. [Error Handling](#error-handling)
8. [Import Patterns](#import-patterns)

---

## Naming Conventions

### Files and Directories

```
✅ GOOD
- useFlashcardManager.ts          # Hooks: camelCase with 'use' prefix
- FlashcardCard.tsx                # Components: PascalCase
- vocabulary.types.ts              # Types: descriptive with .types suffix
- useFlashcards.test.ts            # Tests: same name with .test suffix
- useFlashcards.mock.ts            # Mocks: same name with .mock suffix
- flashcardUtils.ts                # Utilities: camelCase with Utils suffix
- BOUNDARIES.md                    # Documentation: UPPERCASE

❌ BAD
- flashcard-manager.ts             # No kebab-case
- Flashcard_card.tsx               # No snake_case
- flashcardtest.ts                 # Missing .test
- FlashcardMock.ts                 # Should be .mock.ts
```

### Variables and Functions

```typescript
// ✅ GOOD
const studentFlashcards = []; // camelCase for variables
function calculateScore() {} // camelCase for functions
const MAX_ATTEMPTS = 3; // SCREAMING_SNAKE_CASE for constants
interface FlashcardData {} // PascalCase for types/interfaces
type VocabularyItem = {}; // PascalCase for types
enum QuizMode {} // PascalCase for enums

// ❌ BAD
const StudentFlashcards = []; // Not PascalCase for variables
function CalculateScore() {} // Not PascalCase for functions
const maxAttempts = 3; // Should be SCREAMING_SNAKE_CASE
interface flashcardData {} // Should be PascalCase
```

### Component Names

```typescript
// ✅ GOOD
export function FlashcardCard() {} // Descriptive, PascalCase
export function VocabularyList() {} // Clear purpose
export function AudioControl() {} // Matches single responsibility

// ❌ BAD
export function Card() {} // Too generic
export function FlashcardAndVocabulary() {} // Does too much
export function Comp() {} // Meaningless abbreviation
```

### Hook Names

```typescript
// ✅ GOOD
function useFlashcardManager() {} // Descriptive, starts with 'use'
function useAudioPlayer() {} // Clear purpose
function useStudentSearch() {} // Domain-specific

// ❌ BAD
function flashcardManager() {} // Missing 'use'
function useData() {} // Too vague
function useFlashcardManagerHook() {} // Redundant 'Hook'
```

---

## File Organization

### Directory Structure

```
feature-name/
├── index.ts                    # Public API (exports)
├── types.ts                    # Type definitions (if complex)
├── useFeatureName.ts           # Main hook/use case
├── useFeatureName.test.ts      # Tests
├── useFeatureName.mock.ts      # Mocks (if data-returning)
├── units/                      # Sub-units (if needed)
│   ├── useSubUnit1.ts
│   └── useSubUnit2.ts
└── README.md                   # Documentation (if complex)
```

### Index Files (Barrel Exports)

```typescript
// ✅ GOOD: index.ts exports public API only
export { useFlashcardManager } from './useFlashcardManager';
export type { FlashcardManagerResult } from './useFlashcardManager';

// ❌ BAD: Don't export everything
export * from './useFlashcardManager'; // Too broad
export { internalHelperFunction } from './helpers'; // Not public API
```

### Colocated Files

Keep related files together:

```
✅ GOOD
useFlashcards.ts
useFlashcards.test.ts
useFlashcards.mock.ts

❌ BAD
src/hooks/useFlashcards.ts
src/__tests__/useFlashcards.test.ts
src/mocks/useFlashcards.mock.ts
```

---

## TypeScript Patterns

### Explicit Return Types

**Always use explicit return types for hooks and exported functions.**

```typescript
// ✅ GOOD: Explicit return type
export interface FlashcardManagerResult {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: Error | null;
  createFlashcard: (data: FlashcardInput) => void;
}

export function useFlashcardManager(): FlashcardManagerResult {
  // implementation
}

// ❌ BAD: Inferred return type
export function useFlashcardManager() {
  // Return type inferred - NOT ALLOWED
}

// ❌ BAD: Using ReturnType or typeof
type Result = ReturnType<typeof useFlashcardManager>; // NOT ALLOWED
```

### Type vs Interface

```typescript
// ✅ Use interface for object shapes (preferred for public APIs)
export interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

// ✅ Use type for unions, intersections, and utilities
export type QuizMode = 'audio' | 'text' | 'mixed';
export type FlashcardWithMeta = FlashcardData & { createdAt: Date };

// ✅ Use type for function signatures
export type CreateFlashcard = (data: FlashcardInput) => Promise<Flashcard>;
```

### Avoid Any and Unknown

```typescript
// ❌ BAD
function processData(data: any) {
  return data.something; // No type safety
}

// ✅ GOOD: Use specific types
function processFlashcard(flashcard: Flashcard) {
  return flashcard.front;
}

// ✅ GOOD: Use generics when needed
function processItem<T extends { id: string }>(item: T) {
  return item.id;
}

// ✅ OK: Use unknown for truly unknown data, then narrow
function parseResponse(response: unknown) {
  if (isFlashcard(response)) {
    return response; // Now typed as Flashcard
  }
  throw new Error('Invalid response');
}
```

### Discriminated Unions

```typescript
// ✅ GOOD: Use discriminated unions for state
type QueryState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function useData(): QueryState<Flashcard[]> {
  // TypeScript can narrow based on status
}

// Usage
const state = useData();
if (state.status === 'success') {
  console.log(state.data); // TypeScript knows data exists
}
```

---

## React Patterns

### Component Structure

```typescript
// ✅ GOOD: Consistent component structure
interface FlashcardCardProps {
  flashcard: Flashcard;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FlashcardCard({ flashcard, onEdit, onDelete }: FlashcardCardProps) {
  // 1. Hooks at the top
  const [isFlipped, setIsFlipped] = useState(false);
  const audioPlayer = useAudioPlayer();
  
  // 2. Derived state and computations
  const isEditable = flashcard.createdBy === currentUserId;
  
  // 3. Event handlers
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);
  
  const handleEdit = useCallback(() => {
    onEdit(flashcard.id);
  }, [flashcard.id, onEdit]);
  
  // 4. Effects (if needed)
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5. Render
  return (
    <div className="flashcard-card">
      {/* JSX */}
    </div>
  );
}
```

### Props Patterns

```typescript
// ✅ GOOD: Explicit props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  // implementation
}

// ✅ GOOD: Children prop
interface CardProps {
  title: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// ❌ BAD: Spreading unknown props
function BadComponent(props: any) {
  return <div {...props} />; // Type unsafe
}
```

### Conditional Rendering

```typescript
// ✅ GOOD: Early returns for loading/error states
function FlashcardList() {
  const { flashcards, isLoading, error } = useFlashcards();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (error) {
    return <Error message={error.message} />;
  }
  
  if (flashcards.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <ul>
      {flashcards.map(fc => <FlashcardCard key={fc.id} flashcard={fc} />)}
    </ul>
  );
}

// ✅ GOOD: Ternary for simple conditions
function Badge({ count }: { count: number }) {
  return (
    <span className={count > 0 ? 'badge-active' : 'badge-inactive'}>
      {count}
    </span>
  );
}

// ❌ BAD: Complex nested ternaries
function BadComponent({ state }: { state: string }) {
  return (
    <div>
      {state === 'loading' ? (
        <Loading />
      ) : state === 'error' ? (
        <Error />
      ) : state === 'success' ? (
        <Success />
      ) : (
        <Idle />
      )}
    </div>
  );
}
```

---

## Hook Patterns

### Custom Hook Structure

```typescript
// ✅ GOOD: Well-structured hook with explicit return type
export interface FlashcardManagerResult {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: Error | null;
  createFlashcard: (data: FlashcardInput) => Promise<void>;
  updateFlashcard: (id: string, data: FlashcardInput) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
}

export function useFlashcardManager(): FlashcardManagerResult {
  // Fetch data
  const query = useFlashcardsQuery();
  
  // Mutations
  const createMutation = useCreateFlashcardMutation();
  const updateMutation = useUpdateFlashcardMutation();
  const deleteMutation = useDeleteFlashcardMutation();
  
  // Handlers
  const createFlashcard = useCallback(async (data: FlashcardInput) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);
  
  const updateFlashcard = useCallback(async (id: string, data: FlashcardInput) => {
    await updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);
  
  const deleteFlashcard = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);
  
  // Return consolidated interface
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

### Dependencies and Memoization

```typescript
// ✅ GOOD: Proper dependencies
function useFilteredFlashcards(filter: string) {
  const { flashcards } = useFlashcards();
  
  const filtered = useMemo(
    () => flashcards.filter(fc => fc.front.includes(filter)),
    [flashcards, filter] // Include all used variables
  );
  
  return filtered;
}

// ✅ GOOD: Stable callbacks
function useFlashcardActions() {
  const mutation = useFlashcardMutation();
  
  const create = useCallback((data: FlashcardInput) => {
    mutation.mutate(data);
  }, [mutation]); // Mutation is stable from TanStack Query
  
  return { create };
}

// ❌ BAD: Missing dependencies
function useBadHook(filter: string) {
  const { flashcards } = useFlashcards();
  
  const filtered = useMemo(
    () => flashcards.filter(fc => fc.front.includes(filter)),
    [] // Missing dependencies!
  );
  
  return filtered;
}
```

---

## Testing Patterns

### Test Structure

```typescript
// ✅ GOOD: Well-organized test file
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlashcardManager } from './useFlashcardManager';
import { useFlashcardsQueryMock } from '../queries/useFlashcardsQuery.mock';

// Mock dependencies
vi.mock('../queries/useFlashcardsQuery', () => ({
  useFlashcardsQuery: vi.fn(() => useFlashcardsQueryMock.defaultImplementation()),
}));

describe('useFlashcardManager', () => {
  beforeEach(() => {
    // Reset mocks before each test
    useFlashcardsQueryMock.resetMock();
  });
  
  it('should return flashcards from query', () => {
    const { result } = renderHook(() => useFlashcardManager());
    
    expect(result.current.flashcards).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should handle loading state', () => {
    useFlashcardsQueryMock.overrideMock({ isLoading: true });
    
    const { result } = renderHook(() => useFlashcardManager());
    
    expect(result.current.isLoading).toBe(true);
  });
  
  it('should handle error state', () => {
    const error = new Error('Failed to fetch');
    useFlashcardsQueryMock.overrideMock({ error });
    
    const { result } = renderHook(() => useFlashcardManager());
    
    expect(result.current.error).toBe(error);
  });
});
```

### Mock Patterns

```typescript
// ✅ GOOD: Typed, overrideable mock
import { createOverrideableMock } from '@testing/utils';
import type { useFlashcardsQuery } from './useFlashcardsQuery';

export const useFlashcardsQueryMock = createOverrideableMock<typeof useFlashcardsQuery>({
  defaultImplementation: () => ({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  }),
});

// Usage in tests
useFlashcardsQueryMock.overrideMock({
  data: [mockFlashcard1, mockFlashcard2],
});
```

---

## Error Handling

### Query Error Handling

```typescript
// ✅ GOOD: Handle errors at use case level
export function useFlashcardManager(): FlashcardManagerResult {
  const query = useFlashcardsQuery();
  
  return {
    flashcards: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error, // Expose error to UI
  };
}

// In component
function FlashcardPage() {
  const { flashcards, isLoading, error } = useFlashcardManager();
  
  if (error) {
    return <ErrorMessage error={error} />;
  }
  
  // Rest of component
}
```

### Mutation Error Handling

```typescript
// ✅ GOOD: Handle errors with toast notifications
export function useCreateFlashcard() {
  const mutation = useCreateFlashcardMutation();
  
  const create = useCallback(async (data: FlashcardInput) => {
    try {
      await mutation.mutateAsync(data);
      toast.success('Flashcard created successfully');
    } catch (error) {
      toast.error('Failed to create flashcard');
      console.error(error);
    }
  }, [mutation]);
  
  return { create, isCreating: mutation.isPending };
}
```

---

## Import Patterns

### Path Aliases

```typescript
// ✅ GOOD: Use path aliases for imports
import { Flashcard } from '@domain/types';
import { useFlashcardsQuery } from '@application/queries';
import { FlashcardCard } from '@interface/components';
import { createTypedMock } from '@testing/utils';

// ❌ BAD: Relative imports across layers
import { Flashcard } from '../../../domain/types';
import { useFlashcardsQuery } from '../../application/queries';
```

### Import Organization

```typescript
// ✅ GOOD: Organized imports
// 1. External dependencies
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal aliases (grouped by layer)
import { Flashcard } from '@domain/types';
import { useFlashcardsQuery } from '@application/queries';
import { FlashcardCard } from '@interface/components';

// 3. Relative imports
import { formatDate } from './utils';
import type { LocalType } from './types';

// 4. Styles
import './styles.css';
```

---

## Anti-Patterns to Avoid

### ❌ God Components

```typescript
// ❌ BAD: Component doing too much
function FlashcardPageBad() {
  const [flashcards, setFlashcards] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    // Fetch logic
  }, []);
  
  const handleCreate = () => {
    // Create logic
  };
  
  const handleFilter = () => {
    // Filter logic
  };
  
  const handleSort = () => {
    // Sort logic
  };
  
  // 500 lines of JSX...
}

// ✅ GOOD: Delegate to use case
function FlashcardPageGood() {
  const useCase = useFlashcardManager();
  
  return (
    <div>
      <FlashcardList flashcards={useCase.flashcards} />
      <CreateButton onClick={useCase.create} />
    </div>
  );
}
```

### ❌ Prop Drilling

See [Data Flow Guide](./DATA_FLOW.md#common-pitfalls) for details.

### ❌ Premature Optimization

```typescript
// ❌ BAD: Over-optimizing simple component
function SimpleBadge({ count }: { count: number }) {
  const memoizedCount = useMemo(() => count, [count]); // Unnecessary!
  const memoizedLabel = useMemo(() => `Count: ${count}`, [count]); // Unnecessary!
  
  return <span>{memoizedLabel}</span>;
}

// ✅ GOOD: Keep it simple
function SimpleBadge({ count }: { count: number }) {
  return <span>Count: {count}</span>;
}
```

---

## Summary Checklist

- ✅ Use explicit return types for all hooks
- ✅ Follow naming conventions (camelCase, PascalCase, SCREAMING_SNAKE_CASE)
- ✅ Colocate related files (test, mock, types)
- ✅ One component/hook per file
- ✅ Avoid `any`, prefer specific types
- ✅ Use discriminated unions for complex state
- ✅ Memoize appropriately (but don't over-optimize)
- ✅ Handle errors at use case level
- ✅ Use path aliases for cross-layer imports
- ✅ Keep components focused and small

---

## Related Documentation

- [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Architecture guidelines
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing best practices
- [`DATA_FLOW.md`](./DATA_FLOW.md) - State management patterns
- [`FEATURE_WORKFLOW.md`](./FEATURE_WORKFLOW.md) - Building new features
