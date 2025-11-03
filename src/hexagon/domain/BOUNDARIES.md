# Domain Layer Boundaries

## What is This?

The domain layer contains **pure, stateless business logic** with **zero dependencies**. This is the innermost layer of our hexagonal architecture - it knows nothing about React, infrastructure, or any other layer.

## Responsibility

Pure business logic and data transformations:

- Business rules expressed as pure functions
- Data transformation and enrichment
- Type definitions and schema validators
- Mathematical calculations
- Algorithm implementations
- No runtime state, no side effects

## ⚠️ Critical Rules

### ✅ DO

- Write pure functions only (same input = same output)
- Define types, interfaces, and schemas
- Implement business logic without side effects
- Use immutable data structures
- Document complex business rules clearly
- Write 100% test coverage (`*.test.ts` colocated)

### ❌ DON'T

- **NO imports from ANY other layer** (domain, application, infrastructure, interface, composition, testing)
- **NO React** (no hooks, no components, no React types)
- **NO runtime state** (no `useState`, no `useEffect`, no `useMemo`)
- **NO side effects** (no API calls, no localStorage, no mutations)
- **NO framework dependencies** (React, Express, etc.)
- **NO infrastructure** (no HTTP clients, no databases)
- **NO classes or OOP** (functions only, no `this`)
- **NO external dependencies** except pure utility libraries (e.g., date-fns, lodash for pure functions)

## Examples of What Belongs Here

```typescript
// ✅ Pure transformation function
export function calculateSRSInterval(reviewCount: number): number {
  return Math.min(reviewCount * 2, 365);
}

// ✅ Business rule function
export function isQuizComplete(answers: Answer[]): boolean {
  return answers.every(a => a.isCorrect);
}

// ✅ Data enrichment
export function enrichVocabulary(vocab: Vocabulary): EnrichedVocabulary {
  return {
    ...vocab,
    difficulty: calculateDifficulty(vocab),
    frequency: getFrequency(vocab.word),
  };
}

// ✅ Type definitions
export interface Vocabulary {
  id: number;
  word: string;
  translation: string;
}

// ✅ Schema validators (pure validation logic)
export const VocabularySchema = z.object({
  id: z.number(),
  word: z.string().min(1),
});
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ React hooks
export function useVocabulary() { /* ... */ }

// ❌ API calls
export async function fetchVocabulary() {
  return await fetch('/api/vocabulary');
}

// ❌ Infrastructure dependencies
import { httpClient } from '@infrastructure/http';

// ❌ Runtime state
let cachedVocabulary: Vocabulary[] = [];

// ❌ Side effects
export function saveToLocalStorage(data: Vocabulary) {
  localStorage.setItem('vocab', JSON.stringify(data));
}

// ❌ Application layer imports
import { useVocabularyAdapter } from '@application/adapters';
```

## Dependency Rule

**Domain has ZERO dependencies:**

- No imports from other hexagon layers
- No imports from application, infrastructure, interface, composition, or testing
- May import from external pure utility libraries (date-fns, lodash, zod, etc.)
- May define types that other layers import FROM domain

## Testing Requirements

- **100% test coverage** required
- Tests must be colocated (`*.test.ts` next to source files)
- Tests should be pure unit tests (no mocks needed, no setup required)
- Test all edge cases and business rule variations

## Reading Order

When exploring the codebase, start here:
1. `domain/` - Understand core business logic
2. Then move outward to `application/` which uses domain

## Where to Add Code?

- New business rules → Pure functions in appropriate files
- New data transformations → New transformation files
- New type definitions → Type files or existing domain files
- New enrichment logic → Enrichment function files

