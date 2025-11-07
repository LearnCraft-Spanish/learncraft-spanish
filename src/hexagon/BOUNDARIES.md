# Hexagon Architecture Boundaries

## What is This?

The hexagon directory implements an adaptation of **hexagonal architecture** (ports and adapters) with **pragmatic layer boundaries** for the LearnCraft Spanish React SPA.

**Note:** This is **NOT** strict DDD. We use a practical adaptation:

- **Domain** = Pure business logic and data transformations (schemas, types and pure functions)
- **Application** = Business workflows, orchestration, and runtime behavior (mostly hooks)
- **Infrastructure** = External IO, API bindings, and third-party integrations (port implementations)
- **Interface** = React UI components and rendering logic (mostly components)
- **Composition** = Static application bootstrap and provider wiring
- **Testing** = Test utilities, factories, and mock helpers

This architecture supports LearnCraft Spanish's language learning features: vocabulary management, interactive quizzes (audio and text), flashcard systems, course progression, spaced repetition, and multi-role support (students, coaches, admins).

## ⚠️ Longevity Warning: Anemic Domain Model

**Current State:** We have an **anemic domain model** - most business logic lives in the application layer rather than in rich domain objects. The domain layer currently contains mostly pure transformation functions and type definitions.

**Why This Exists:**

For a React SPA, this approach is somewhat reasonable because:

- React's hook-based architecture naturally encourages behavior in hooks (application layer)
- Frontend state management patterns align with anemic models
- Many business rules are tied to UI interactions and React state
- The pragmatic approach gets features shipped faster

**Known Risks:**

- Business rules scattered across use-cases and units
- Hard to find "what are the rules for X?"
- Can lead to duplication as complexity grows
- Refactoring becomes harder over time
- Testing individual rules requires full orchestration setup
- Domain knowledge is less explicit and discoverable

**Current Mitigation Strategy:**

- Document business rules clearly in comments (like the "cumulative" vs "range" distinction)
- Keep related logic together (units directory)
- Write thorough tests that capture the business semantics
- Use explicit return types on use-cases to document behavior

**Future Mitigation Strategy:**

As the application grows, consider incrementally enriching the domain:

1. **Identify Complex Rules:** When business rules become complex or are duplicated across multiple use-cases, extract them to domain functions
2. **Domain Aggregates:** For entities with rich behavior (e.g., Quiz, Vocabulary, Flashcard), consider creating domain functions that encapsulate their rules
3. **Value Objects:** Extract domain concepts into value objects (e.g., `QuizConfig`, `LessonRange`) that enforce invariants
4. **Incremental Refactoring:** Move logic to domain layer incrementally, not in big-bang rewrites
5. **Domain Events:** Consider domain events for cross-aggregate coordination as complexity increases

**Decision Criteria for Moving to Domain:**

- Rule is used in 3+ places → Consider domain function
- Rule has complex conditional logic → Consider domain function
- Rule represents core business concept → Consider domain function
- Rule is pure (no side effects) → Good candidate for domain

## Layer Responsibilities

Dependencies flow inward (outermost → innermost):

```
┌─────────────────────────────────────┐
│  composition/ - Static bootstrap    │
│  (Providers, root render)           │
│  ↓ depends on interface             │
├─────────────────────────────────────┤
│  interface/   - React UI            │
│  (Components, pages, routing)       │
│  ↓ depends on application/use-cases │
├─────────────────────────────────────┤
│  infrastructure/ - External adapters│
│  (HTTP clients, API bindings)       │
│  - Side effects                     │
│  - Third-party integrations         │
│  ↓ implements application ports     │
├─────────────────────────────────────┤
│  application/ - Business workflows  │
│  (Use-cases, units, coordinators)   │
│  - Complex orchestration            │
│  - Multi-source coordination        │
│  - React hooks and state            |
|  — NO COMPONENTS OR TSX             │
├─────────────────────────────────────┤
│  domain/      - Pure logic          │
│  (Pure functions, transformations)  │
│  - Business rules                   │
│  - Data transformations             │
│  - NO REACT                         │
│  (No dependencies - innermost)      │
└─────────────────────────────────────┘
```

## Dependency Rule

**Dependencies flow INWARD only:**

- Domain has NO dependencies (not even other layers)
- Application depends only on domain
- Infrastructure implements application ports (no business logic)
- Interface depends on application layer (no more than one hook, via explicit return type)
- Composition depends on interface and wires everything together
- Testing depends on all layers for mocks and factories
- **NEVER let inner layers know about outer layers**

### ⚠️ Two Exceptions to the Dependency Rule

These exceptions accommodate React's patterns: adapters bridge infrastructure via hooks, and coordinators access composition-layer context through React's context API:

1. **Adapters → Infrastructure**: Adapters (in `application/adapters/`) import from `infrastructure/` to wrap infrastructure implementations. This is a pragmatic concession for the React idiom, since injection of an adapter hook to a port at composition doesn't fit idiomatic React.

   ```typescript
   // application/adapters/vocabularyAdapter.ts
   import { createVocabularyInfrastructure } from '@infrastructure/vocabulary/vocabularyInfrastructure';

   export function useVocabularyAdapter(): VocabularyPort {
     return createVocabularyInfrastructure(/* ... */);
   }
   ```

2. **Coordinators → Composition**: Coordinator hooks (in `application/coordinators/hooks/`) can import context-accessing hooks from `composition/` to access composition-layer context. Coordinators should NOT import providers directly - providers are composed at the composition layer level. Only the context-accessing hooks are used by coordinators.

   ```typescript
   // ✅ CORRECT: Coordinator hook uses context-accessing hook
   // application/coordinators/hooks/useAudioCoordinator.ts
   import { useAudioContext } from '@composition/context/AudioContext';

   export function useAudioCoordinator() {
     const audioEngine = useAudioContext(); // Exception: coordinator accesses composition context
     // ... use audioEngine
   }

   // ❌ INCORRECT: Coordinator provider should NOT import composition providers
   // application/coordinators/providers/MainProvider.tsx
   // import { AudioEngineProvider } from '@composition/providers/AudioProvider'; // NO!
   // Providers are composed at composition layer, not in coordinator providers
   ```

**Why these exceptions are acceptable:**

- They're limited to specific, well-defined boundaries:
  - Adapters wrapping infrastructure (adapters exist to bridge infrastructure)
  - Coordinators accessing composition context via hooks (context access, not provider composition)
- They don't introduce business logic dependencies
- They maintain separation of concerns while enabling necessary composition
- Provider composition happens at the composition layer, not in coordinators

## Strict Dos and Don'ts

### ✅ DO

- Keep each layer focused on its responsibility
- Use pure functions in domain
- Use React hooks in application for runtime behavior
- **Use EXPLICIT return types for ALL hooks** (no inferred types, no `typeof`, export interfaces)
- Keep domain framework-agnostic (no React)
- Let composition wire all dependencies
- Document business rules clearly in comments
- Use typed mocks in tests

### ❌ DON'T

- NO classes or OOP patterns anywhere
- NO `this` keyword
- NO mutable state in domain
- NO React types or hooks in domain
- NO framework types (React, etc.) in domain
- NO direct infrastructure imports in domain/application (use ports)
- NO business logic in infrastructure/interface
- NO HTTP types outside infrastructure layer
- NO database types outside infrastructure layer
- NO untyped mocks (`vi.fn()` - use `createTypedMock<T>()`)
- **NO inferred return types for hooks** (no `typeof`, no `ReturnType<>`, no type inference - always export interfaces)

## Reading Order

1. `domain/` - Core business logic
2. `application/` - Use cases and orchestration
3. `infrastructure/` - External service adapters
4. `interface/` - React UI components
5. `composition/` - Application bootstrap
6. `testing/` - Test utilities and patterns

## Where to Add Code?

- New business rules → `application/` (for now, see longevity warning)
- New pure transformations → `domain/`
- New use cases → `application/useCases/`
- New reusable hooks → `application/units/`
- New shared state → `application/coordinators/`
- New external services → `infrastructure/`
- New React components → `interface/components/`
- New pages/routes → `interface/pages/`
- New providers → `composition/providers/`
- New test utilities → `testing/`
