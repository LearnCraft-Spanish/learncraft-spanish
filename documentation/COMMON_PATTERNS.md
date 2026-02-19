# Common Patterns & Conventions

_Code patterns and conventions for LearnCraft Spanish._

For architecture rules, see [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) and the `BOUNDARIES.md` in each layer. For testing patterns, see [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md).

---

## Naming Conventions

### Files

```
useFlashcardManager.ts          # Hooks: camelCase with 'use' prefix
FlashcardCard.tsx                # Components: PascalCase
vocabulary.types.ts              # Types: descriptive with .types suffix
useFlashcards.test.ts            # Tests: same name with .test suffix
useFlashcards.mock.ts            # Mocks: same name with .mock suffix
BOUNDARIES.md                    # Documentation: UPPERCASE
```

### Code

```typescript
const studentFlashcards = [];     // camelCase for variables
function calculateScore() {}      // camelCase for functions
const MAX_ATTEMPTS = 3;           // SCREAMING_SNAKE_CASE for constants
interface FlashcardData {}        // PascalCase for types/interfaces
type QuizMode = 'audio' | 'text'; // PascalCase for types
```

### Components and Hooks

```typescript
export function FlashcardCard() {}    // PascalCase, descriptive
export function useFlashcardManager() {} // 'use' prefix, descriptive
```

Avoid generic names (`Card`, `useData`), abbreviations (`Comp`, `mgr`), and redundant suffixes (`useFlashcardManagerHook`).

---

## File Organization

### Feature Directory Structure

```
feature-name/
├── index.ts                    # Public API (exports)
├── types.ts                    # Type definitions (if complex)
├── useFeatureName.ts           # Main hook/use case
├── useFeatureName.test.ts      # Tests (colocated)
├── useFeatureName.mock.ts      # Mock (if data-returning)
└── units/                      # Sub-units (if needed)
    ├── useSubUnit1.ts
    └── useSubUnit2.ts
```

### Barrel Exports

```typescript
// index.ts — export public API only
export { useFlashcardManager } from './useFlashcardManager';
export type { FlashcardManagerResult } from './useFlashcardManager';

// Don't: export * from './useFlashcardManager';
// Don't: export internal helpers
```

### Colocated Files

Keep related files together: `useFlashcards.ts`, `useFlashcards.test.ts`, and `useFlashcards.mock.ts` live in the same directory.

---

## TypeScript Patterns

### Explicit Return Types (Required)

All hooks and exported functions must have explicit return types. No inference, no `typeof`, no `ReturnType<>`.

```typescript
// Required pattern:
export interface FlashcardManagerResult {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: Error | null;
  createFlashcard: (data: FlashcardInput) => void;
}

export function useFlashcardManager(): FlashcardManagerResult {
  // implementation
}
```

### Type vs Interface

- `interface` for object shapes (preferred for public APIs)
- `type` for unions, intersections, function signatures

### Avoid `any`

Use specific types, generics, or `unknown` (then narrow). Never use `@ts-ignore`.

---

## React Patterns

### Component Structure

```typescript
interface Props {
  flashcard: Flashcard;
  onEdit: (id: string) => void;
}

export function FlashcardCard({ flashcard, onEdit }: Props) {
  // 1. Hooks
  // 2. Derived state
  // 3. Event handlers (useCallback)
  // 4. Effects (if needed)
  // 5. Return JSX
}
```

### Page Pattern (One Use Case Per Page)

Pages call exactly one use case hook:

```typescript
export function FlashcardsPage() {
  const useCase = useFlashcardManager();

  if (useCase.isLoading) return <Loading />;
  if (useCase.error) return <ErrorMessage error={useCase.error} />;

  return <FlashcardList flashcards={useCase.flashcards} />;
}
```

### Conditional Rendering

Use early returns for loading/error states. Avoid deeply nested ternaries.

---

## Hook Patterns

### Use Case Hook

Use cases orchestrate units, queries, and coordinators into a single interface for a page:

```typescript
export function useFlashcardManager(): FlashcardManagerResult {
  const query = useFlashcardsQuery();
  const createMutation = useCreateFlashcardMutation();
  const audio = useAudioCoordinator();

  const createFlashcard = useCallback(async (data: FlashcardInput) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);

  return {
    flashcards: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createFlashcard,
    playAudio: audio.play,
  };
}
```

### Memoization

Use `useMemo` for expensive derived values and `useCallback` for callbacks passed as props. Don't over-memoize simple values.

---

## Import Patterns

### Path Aliases

```typescript
import { Flashcard } from '@domain/types';
import { useFlashcardsQuery } from '@application/queries';
import { FlashcardCard } from '@interface/components';
import { createTypedMock } from '@testing/utils';
```

Don't use relative imports across layers (`../../../domain/types`).

### Import Order

1. External dependencies (`react`, `@tanstack/react-query`)
2. Internal aliases by layer (`@domain`, `@application`, `@interface`)
3. Relative imports (`./utils`, `./types`)
4. Styles (`./styles.css`)
