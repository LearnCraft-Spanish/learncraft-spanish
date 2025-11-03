# Ports Boundaries

## What is This?

Ports define **interfaces for external dependencies** that infrastructure must implement. They enable dependency inversion and make the application layer independent of concrete infrastructure implementations.

## Responsibility

Type definitions for external dependencies:

- Define interfaces that infrastructure must implement
- Specify required behavior without implementation
- Enable dependency inversion
- Allow for easy mocking in tests
- Document expected contracts

## ⚠️ Critical Rules

### ✅ DO

- Define pure TypeScript interfaces/types
- Keep ports focused and minimal
- Document assumptions or requirements
- Use clear, descriptive names
- Match infrastructure capabilities realistically
- Export types/interfaces only

### ❌ DON'T

- **NO implementation details** (pure types only)
- **NO default implementations** (that's adapters/infrastructure)
- **NO business logic** (pure interface definitions)
- **NO React hooks or components** (just types)
- **NO classes** (TypeScript interfaces/types only)
- **NO imports from infrastructure** (would break dependency rule)
- **NO imports from other layers** (except domain types if needed)

## Dependency Rules

**Ports can depend on:**

- ✅ `domain/` - Use domain types in port definitions
- ✅ TypeScript standard library
- ❌ Cannot import from `infrastructure/` (that's what we're abstracting)
- ❌ Cannot import from `application/` (except domain types through re-export)
- ❌ Cannot be imported by `domain/`
- ✅ Can be imported by `application/adapters/`, `application/useCases/`, etc.

## Examples of What Belongs Here

```typescript
// ✅ Simple port definition
export interface VocabularyPort {
  getVocabulary(): Promise<Vocabulary[]>;
  createVocabulary(data: CreateVocabularyData): Promise<Vocabulary>;
  updateVocabulary(id: number, data: UpdateVocabularyData): Promise<Vocabulary>;
  deleteVocabulary(id: number): Promise<void>;
}

// ✅ Port with domain types
import type { Vocabulary } from '@domain/types';
import type { Lesson } from '@domain/types';

export interface ExamplePort {
  getExamples(filters: ExampleFilters): Promise<Example[]>;
  createExample(data: CreateExampleData): Promise<Example>;
}

// ✅ Port for authentication
export interface AuthPort {
  login(credentials: Credentials): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
}

// ✅ Port with complex types
export interface FlashcardPort {
  getFlashcards(userId: number): Promise<Flashcard[]>;
  createFlashcard(data: CreateFlashcardData): Promise<Flashcard>;
  updateFlashcard(id: number, data: UpdateFlashcardData): Promise<Flashcard>;
  deleteFlashcard(id: number): Promise<void>;
}
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ Implementation details
export interface VocabularyPort {
  // ❌ NO! Implementation details don't belong in ports
  getVocabulary(): Promise<Vocabulary[]> {
    return fetch('/api/vocabulary').then(r => r.json());
  }
}

// ❌ Default implementations
export const vocabularyPort: VocabularyPort = {
  // ❌ NO! Implementations belong in infrastructure/adapters
  getVocabulary: async () => [],
};

// ❌ Business logic
export interface VocabularyPort {
  getVocabulary(): Promise<Vocabulary[]>;
  // ❌ NO! Filtering is business logic - belongs in application layer
  getActiveVocabulary(): Promise<Vocabulary[]>;
}

// ❌ React-specific code
export interface VocabularyPort {
  // ❌ NO! Hooks don't belong in ports
  useVocabulary(): Vocabulary[];
}

// ❌ Infrastructure imports
import { httpClient } from '@infrastructure/http';
export interface VocabularyPort {
  // ❌ NO! Would break dependency inversion
  client: typeof httpClient;
}
```

## Port Design Principles

### 1. Keep Ports Focused

Each port should represent one logical external dependency:

```typescript
// ✅ Good: Focused port
export interface VocabularyPort {
  // Vocabulary-related operations only
}

// ❌ Bad: Too broad
export interface DataPort {
  // Mixing vocabulary, examples, flashcards, etc.
}
```

### 2. Match Infrastructure Capabilities

Ports should reflect what infrastructure can actually provide:

```typescript
// ✅ Realistic port
export interface VocabularyPort {
  getVocabulary(): Promise<Vocabulary[]>; // Async is realistic
}

// ❌ Unrealistic expectations
export interface VocabularyPort {
  getVocabulary(): Vocabulary[]; // Sync might not be possible
}
```

### 3. Use Domain Types

Leverage domain types in port definitions:

```typescript
import type { Vocabulary, Lesson } from '@domain/types';

export interface ExamplePort {
  getExamples(lesson: Lesson): Promise<Example[]>;
  createExample(vocabulary: Vocabulary): Promise<Example>;
}
```

## Testing

Ports are pure types, so they don't need tests. However:

- Mock implementations in `application/adapters/*.mock.ts` should match ports
- Infrastructure implementations must match ports
- Tests verify that adapters/infrastructure conform to ports

## Reading Order

1. `ports/` - Understand required interfaces
2. `application/adapters/` - See how ports are implemented
3. `infrastructure/` - See concrete implementations
4. `application/useCases/` - See how ports are used

## Where to Add Code?

- New external dependency interface → New port file
- New operations on existing dependency → Update port file
- Type definitions for port → Port file or types file

## Key Distinctions

**Ports vs Adapters:**

- Ports = Interface definitions (types)
- Adapters = React hooks that wrap infrastructure to match ports

**Ports vs Infrastructure:**

- Ports = What we need (contract)
- Infrastructure = What we have (implementation)

**Ports vs Domain:**

- Ports = External dependency contracts
- Domain = Core business types

## Port Usage Pattern

```typescript
// 1. Define port (ports/vocabularyPort.ts)
export interface VocabularyPort {
  getVocabulary(): Promise<Vocabulary[]>;
}

// 2. Adapter implements port (adapters/vocabularyAdapter.ts)
export function useVocabularyAdapter(): VocabularyPort {
  const infra = useVocabularyInfrastructure();
  return { getVocabulary: infra.getVocabulary };
}

// 3. Infrastructure implements adapter (infrastructure/vocabularyInfrastructure.ts)
export function useVocabularyInfrastructure() {
  return {
    getVocabulary: async () => {
      return await httpClient.get(SharedEndpoints.vocabulary.list.path);
    },
  };
}

// 4. Use-case uses adapter (useCases/useVocabulary.ts)
export function useVocabulary() {
  const adapter = useVocabularyAdapter();
  // Use adapter.getVocabulary()
}
```

This pattern ensures the application layer never directly depends on infrastructure.
